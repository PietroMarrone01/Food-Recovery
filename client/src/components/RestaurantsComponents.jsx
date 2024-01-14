import 'bootstrap-icons/font/bootstrap-icons.css';
import { Button, Table, Row, Col } from 'react-bootstrap';
import { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {Restaurant} from './Miscellaneous';




function ResRow(props) {
  const navigate = useNavigate();
  const { e, userId } = props;

  const isUserAuthenticated = userId !== undefined;  // Verifica se l'utente è autenticato

  return (
    <tr>
      <td>{e.name}</td>
      <td>{e.address}</td>
      <td>{e.phoneNumber}</td>
      <td>{e.cuisineType}</td>
      <td>{e.foodCategory}</td>
      <td>
        <Button
          variant='primary' 
          onClick={() => {
            props.setLoading(true);
            props.showPackages(e.id);
            navigate(`/restaurants/${e.id}`); }}
          disabled={!isUserAuthenticated}
        >
          Entra nel negozio!
        </Button>
      </td>
    </tr>
  );
}


function MainRestaurants(props) {
  
  const navigate = useNavigate();

  const restaurantsList = props.restaurants.map((restaurant) => {
    const { id, name, address, phoneNumber, cuisineType, foodCategory } = restaurant;
    return new Restaurant(id, name, address, phoneNumber, cuisineType, foodCategory);
  });

  /** ---- INIZIO PARTE PER ORDINAMENTO ALFABETICO ---- */
  /** Stato locale per la visualizzazione in ordine alfabetico */
  const [sortOrder, setSortOrder] = useState('asc');  

  if (sortOrder === 'asc') {
    restaurantsList.sort((a, b) => a.name.localeCompare(b.name));
  } else if (sortOrder === 'desc') {
    restaurantsList.sort((a, b) => b.name.localeCompare(a.name));
  }

  const sortByName = () => {
    setSortOrder( (oldSortOrder) => oldSortOrder === 'asc' ? 'desc' : 'asc' );
  }
  /** ---- FINE PARTE PER ORDINAMENTO ALFABETICO ---- */

  return (
    <>
      <Row>
        <Col className="mt-3">
          <p className='fw-bold'>Restaurants ({props.restaurants.length}):</p>
        </Col>
      </Row>
      <Row>
        <Col>
          <Table hover>
            <thead>
              <tr>
                <th>Nome
                  {/*Vicino a stringa "Nome" piazzo il tag "i" che in base al valore dello stato sortOrder cambia disengo. Al click del disegno, chiama la funzione sortByScore che si occupa della modifica dello stato*/}
                  <i className={'mx-1 '+(sortOrder ==='asc' ? 'bi bi-sort-alpha-up' : 'bi bi-sort-alpha-down')} onClick={sortByName} style={{color: 'black'}}/>
                </th>
                <th>Indirizzo</th>
                <th>Numero di telefono</th>
                <th>Tipo di cucina</th>
                <th>Categoria di cibo</th>
              </tr>
            </thead>
            <tbody>
              {restaurantsList.map((restaurant) =>
                <ResRow e={restaurant} userId={props.user && props.user.id} key={restaurant.id} showPackages={props.showPackages} setLoading={props.setLoading}/>)
              }
            </tbody>
          </Table>
        </Col>
      </Row>
      <Row>
        <Col>
        <Button variant='secondary' onClick={()=>navigate('/bookings')} disabled={props.user?.id? false : true}> Le mie prenotazioni </Button>
        </Col>
      </Row>
    </>
  )
}

export { MainRestaurants, ResRow };