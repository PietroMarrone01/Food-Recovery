import React from 'react';
import 'bootstrap-icons/font/bootstrap-icons.css';
import { Button, Table, Row, Col, Alert } from 'react-bootstrap';
import { useState, useContext } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {NavHeader, LoginForm, Restaurant, Package} from './Miscellaneous';
import { LoadingSpinner } from './Routes';
import dayjs from 'dayjs';

function PackageRow(props) {
  const { p, addToCart, setShowCart, addedRestaurants } = props;

  const renderPackageType = () => {
    return p.surprisePackage ? 'Pacchetto sorpresa' : 'Pacchetto normale';
  };

  const renderContent = () => {
    if (p.content && p.content.length > 0) {
      // If there are items in content, show them as a bulleted list
      return (
        <ul>
          {p.content.map((item, index) => (
            <li key={index}>
              {item.name} - Quantità: {item.quantity}
            </li>
          ))}
        </ul>
      );
    } else {
      return 'Non è possibile visualizzare il contenuto';
    }
  };
  

  const renderAvailability = () => {
    return p.availability ? 'Disponibile' : 'Prenotato';
  };

  const startTime = p.startTime.format('HH:mm');
  const endTime = p.endTime.format('HH:mm');
  const currentTime = dayjs().format('HH:mm');

  // Function to check if the current time is between startTime and endTime
  const timeCheck = (currentTime, endTime) => {
    return currentTime < endTime;
  };

  const isWithinTimeRange = timeCheck(currentTime, endTime);

  return (
    <tr>
      <td>{renderPackageType()}</td>
      <td>{renderContent()}</td>
      <td>{p.price}</td>
      <td>{p.size}</td>
      <td>{startTime}</td>
      <td>{endTime}</td>
      <td>{renderAvailability()}</td>
      <td>
        <Button variant='primary' className='float-end' onClick={()=>{addToCart(p); setShowCart(true)}}
        disabled={addedRestaurants.includes(p.restaurantId) || p.availability===0 || !isWithinTimeRange}>
          Add to Cart
        </Button>
      </td>
    </tr>
  );
}

function PackagesList(props) {

  const { showBookings, setLoading } = props;

  const navigate = useNavigate();

  const { resId } = useParams();

  /**
   * Creo un array di oggetti di tipo Package. 
   * Setto a 0 il campo "removedItems" --> sarà incrementato quando elimino un tipo di cibo da un pacchetto presente nel carrello 
   **/
  const packagesList = props.packages.map((p) => {
    const { id, restaurantId, restaurantName, surprisePackage, content, price, size, startTime, endTime, availability} = p;
    return new Package(id, restaurantId, restaurantName, surprisePackage, content, price, size, startTime, endTime, availability, 0);
  });

  // Function to count the number of objects with availability = 0
  function countAvailabilityZero(packagesList) {
    return packagesList.filter(p => p.availability === 0).length;
  }
  
  // Function to count the number of objects with availability = 1
  function countAvailabilityOne(packagesList) {
    return packagesList.filter(p => p.availability === 1).length;
  }

  return (
    props.loading? <LoadingSpinner /> : 
    <>
      <Row>
        <Col className="mt-3">
          <Alert variant="info" className="text-center">
            <h5 className="font-weight-bold">
            It is possible to add only one available package per restaurant to the cart. Packages whose "Withdrawal End Date" has expired can no longer be selected.
            </h5>
          </Alert>
        </Col>
      </Row>
      <Row>
        <Col className="mt-3">
          <p className='fw-bold'>Packages available in the restaurant: {packagesList[0].restaurantName}</p>
          <p>Number of packages available: {countAvailabilityOne(packagesList)}</p>
          <p>Number of packages booked: {countAvailabilityZero(packagesList)}</p>
        </Col>
      </Row>
      <Row>
        <Col>
          <Table hover>
            <thead>
              <tr>
                <th>Package type</th>
                <th>Content</th>
                <th>Price</th>
                <th>Size</th>
                <th>Start Time</th>
                <th>End Time</th>
                <th>Availability</th>
              </tr>
            </thead>
            <tbody>
              {packagesList.map((p) =>
                <PackageRow p={p} key={p.id} addToCart={props.addToCart} setShowCart={props.setShowCart} addedRestaurants={props.addedRestaurants}/>)
              }
            </tbody>
          </Table>
        </Col>
      </Row>
      <Row className="mb-2">
        <Col>
        <Button variant='secondary' onClick={() => {
          setLoading(true);
          showBookings();
          navigate('/bookings'); }} 
          disabled={props.user?.id? false : true}> My reservations
        </Button>
        </Col>
      </Row>
      <Row>
        <Col>
        <Button variant='secondary' onClick={()=>navigate('/')} disabled={props.user?.id? false : true}> Return to Restaurants </Button>
        </Col>
      </Row>
    </>
  )
}

export default PackagesList;
