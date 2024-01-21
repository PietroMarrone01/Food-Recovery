import { Form, Alert, Navbar, Container, Row, Col, Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { useState } from 'react';
import API from '../API';


/** NAVBAR */
function NavHeader(props) {
    const navigate = useNavigate();

    const name = props.user && props.user.name;

    const handleLogout = () => {
        // Effettua l'operazione di logout
        props.logout();
        // Naviga alla route principale "/"
        navigate("/");
    };

    return (
        <Navbar bg='black' variant='dark'>
            <Container fluid>
                <Navbar.Brand className='fs-2' href="/" onClick={event => {event.preventDefault(); navigate("/");}}>
                    <span role="img" aria-label="restaurant">🍔</span> Don't Waste, l'App contro lo spreco alimentare
                </Navbar.Brand>
                <Navbar.Toggle />
                <Navbar.Collapse className="justify-content-end">
                    { name ? (
                        <>
                            <Navbar.Text className='fs-5 text-white'>
                                {"Signed in as: " + name}
                            </Navbar.Text>
                            <Button className='mx-2' variant='light' onClick={handleLogout}>
                                Logout
                            </Button>
                        </>
                    ) : (
                        <Button className='mx-2' variant='warning' onClick={() => navigate('/login')}>
                            Login
                        </Button>
                    )}
                </Navbar.Collapse>
            </Container>
        </Navbar>
    );
}

/** 
 * FORM PER IL LOGIN 
 */
function LoginForm(props) {
    const [username, setUsername] = useState('harry@test.com');
    const [password, setPassword] = useState('pwd');
    const [errorMessage, setErrorMessage] = useState('') ;  //stato di errore specifico per il form di login
  
    const navigate = useNavigate();
  
    const doLogIn = (credentials) => {
      API.logIn(credentials)
        .then( user => {
          setErrorMessage('');
          props.loginSuccessful(user);
        })
        .catch(err => {
          // NB: Generic error message, should not give additional info (e.g., if user exists etc.)
          setErrorMessage('Username o password non corretti');
        })
    }
    
    const handleSubmit = (event) => {
      event.preventDefault();
      setErrorMessage('');
      const credentials = { username, password };  // Username e password prese direttamente dallo stato

      let valid = true;
      if (username === '' || password === '') {
        valid = false;
        setErrorMessage('I campi username e/o password non possono essere vuoti.');
      }
    
      if (valid) {
        doLogIn(credentials);
      }
    };
    
  
    return (
        <Container>
            <Row>
                <Col xs={3}></Col>
                <Col xs={6}>
                    <h2>Login</h2>
                    <Form onSubmit={handleSubmit}>
                        {errorMessage ? <Alert variant='danger' dismissible onClick={()=>setErrorMessage('')}>{errorMessage}</Alert> : ''}
                        <Form.Group controlId='username'>
                            <Form.Label>Email</Form.Label>
                            <Form.Control type='email' value={username} onChange={ev => setUsername(ev.target.value)} />
                        </Form.Group>
                        <Form.Group controlId='password'>
                            <Form.Label>Password</Form.Label>
                            <Form.Control type='password' value={password} onChange={ev => setPassword(ev.target.value)} />
                        </Form.Group>
                        <Button className='my-2' type='submit'>Login</Button>  
                        <Button className='my-2 mx-2' variant='danger' onClick={()=>navigate('/')}>Cancel</Button>
                    </Form>
                </Col>
                <Col xs={3}></Col>
            </Row>
        </Container>
      )
  }

/**
 * FUNZIONI COSTRUTTRICI
 */

/**
 * Il tipo di Ristorante, utilizzato nell'applicazione.
 */
function Restaurant(id, name, address, phoneNumber, cuisineType, foodCategory) {
    this.id = id;
    this.name = name;
    this.address = address;
    this.phoneNumber = phoneNumber;
    this.cuisineType = cuisineType;
    this.foodCategory = foodCategory;
  }

/**
 * Il tipo di Pacchetto offerto dal ristorante, utilizzato nell'applicazione.
 * @param surprisePackage indica se il pacchetto è una sorpresa (0 per pacchetto normale, 1 per sorpresa)
 * @param availability indica se il pacchetto è disponibile (0 per false, 1 per true)
 * @param removedItems indica il numero di tipi di cibo eliminati per ciascun pacchetto presente nel carrello 
 */
function Package(id, restaurantId, restaurantName, surprisePackage, content, price, size, startTime, endTime, availability, removedItems) {
  this.id = id;
  this.restaurantId = restaurantId;
  this.restaurantName = restaurantName;
  this.surprisePackage = surprisePackage;
  this.content = content;
  this.price = price;
  this.size = size;
  this.startTime = startTime;
  this.endTime = endTime;
  this.availability = availability;
  this.removedItems = removedItems;
}

export {NavHeader, LoginForm, Restaurant, Package};
