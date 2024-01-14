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

/** FORM PER IL LOGIN */
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
    
      /** VALIDAZIONE: Verifica che lo username sia un indirizzo email valido 
       *   ^[^\s@]+: verifica che ci sia almeno un carattere all'inizio dell'indirizzo email e che non sia uno spazio o il simbolo "@".
       *   @[^\s@]+: verifica la presenza del simbolo "@" seguito da almeno un carattere che non sia uno spazio o il simbolo "@".
       *   \.[^\s@]+$: verifica che ci sia un punto seguito da almeno un carattere che non sia uno spazio o il simbolo "@" alla fine dell'indirizzo email.
       */ 
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      let valid = true;
      
      if (!emailRegex.test(username)) {
        valid = false;
        setErrorMessage('Il campo username deve contenere un indirizzo email valido.');
      } else if (username === '' || password === '') {
        valid = false;
        setErrorMessage('I campi username e/o password non possono essere vuoti.');
      }
    
      if (valid) {
        doLogIn(credentials);
      }
      // Altrimenti, i messaggi di errore sono già impostati
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

//COSTRUTTORI
/**
 * Il tipo di Ristorante, utilizzato nell'applicazione.
 * Questa è una funzione costruttrice, pensata per essere chiamata con "new".
 *
 * @param id l'identificatore univoco per il ristorante
 * @param name il nome del ristorante
 * @param address l'indirizzo del ristorante
 * @param phoneNumber il numero di telefono del ristorante
 * @param cuisineType il tipo di cucina offerto dal ristorante
 * @param foodCategory la categoria alimentare del ristorante
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
 * Questa è una funzione costruttrice, pensata per essere chiamata con "new".
 *
 * @param id l'identificatore univoco per il pacchetto
 * @param restaurantId l'identificatore del ristorante a cui il pacchetto appartiene
 * @param restaurantName il nome del ristorante
 * @param isSurprisePackage indica se il pacchetto è una sorpresa (0 per pacchetto normale, 1 per sorpresa)
 * @param content la descrizione o il contenuto del pacchetto
 * @param price il prezzo del pacchetto
 * @param size la dimensione o quantità del pacchetto
 * @param startTime l'ora di inizio prelievo del pacchetto
 * @param endTime l'ora di fine prelievo del pacchetto
 * @param availability indica se il pacchetto è disponibile (0 per false, 1 per true)
 */
function Package(id, restaurantId, restaurantName, isSurprisePackage, content, price, size, startTime, endTime, availability) {
  this.id = id;
  this.restaurantId = restaurantId;
  this.restaurantName = restaurantName;
  this.isSurprisePackage = isSurprisePackage;
  this.content = content;
  this.price = price;
  this.size = size;
  this.startTime = startTime;
  this.endTime = endTime;
  this.availability = availability;
}

export {NavHeader, LoginForm, Restaurant, Package};
