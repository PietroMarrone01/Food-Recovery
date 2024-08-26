import React from 'react';
import 'bootstrap-icons/font/bootstrap-icons.css';
import { Button, Table, Row, Col, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import '../mycss.css';


function BookRow(props) {
  const { booking, deleteBooking } = props;

  let statusClass = null;

  switch(booking.status) {
    case 'deleted':
      statusClass = 'table-danger';
      break;
    default:
      break;
  }

  return (
    <tr key={booking.id} className={statusClass}>
      <td>{props.index + 1}</td>
      <td>{booking.packages.length}</td>
      <td>
        <ol>
          {booking.packages.map((p) => (
            <li key={`${booking.id}-${p.packageId}`}>
              <strong className="green-underline-text">Restaurant {p.restaurantName}:</strong> <br />
              <strong>Type:</strong> {p.surprisePackage ? 'Sorpresa' : 'Normale'} <br />
              <strong>Price:</strong> {p.price} <br />
              <strong>Size:</strong> {p.size} <br />
              <strong>Start Time:</strong> {p.startTime.format('HH:mm')} <br />
              <strong>End Time:</strong> {p.endTime.format('HH:mm')}
            </li>
          ))}
        </ol>
      </td>
      <td>
        <ol>
          {booking.packages.map((p) => (
          <li key={`${booking.id}-${p.packageId}-content`}>
            <strong className="green-underline-text">Restaurant {p.restaurantName} :</strong>
            {p.content ? (
            <ul>
              {p.content.map((item, index) => (
              <li key={`${booking.id}-${p.packageId}-content-${index}`}>
                {item.name} - Quantity: {item.quantity}
              </li>
              ))}
            </ul>) : (
            <ul>
              <li>Surprise package, no content available</li>
            </ul>)}
          </li>
          ))}
        </ol>
      </td>
      <td>
        <Button variant="danger" onClick={() => {
          deleteBooking(booking.id); 
          }} >
          Cancel reservation
        </Button>
      </td>
    </tr>
  );
}


function BookingsList(props) {
  const navigate = useNavigate();
  const { bookings, user } = props;

  const noBookings = bookings.length === 0; 

  return (
    <>
      <h2>List of reservations made by {user.name}</h2>
      {noBookings?           
      <Alert variant="info" className="text-center">
        <h5 className="font-weight-bold">
        You haven't made any reservations yet. Go back to the restaurants to book your packages!
        </h5>
      </Alert> :       
      <Table hover>
        <thead>
          <tr>
            <th>Reservation number</th>
            <th>No. of packages booked</th>
            <th>Package Details</th>
            <th>Package Contents</th>
          </tr>
        </thead>
        <tbody>
          {bookings.map((booking, index) => (
            <BookRow key={booking.id} booking={booking} index={index} user={user} deleteBooking={props.deleteBooking}/>
          ))}
        </tbody>
      </Table>}
      <Row className="mt-3">
        <Col>
          <Button variant="secondary" onClick={() => navigate('/')} disabled={!user?.id}>
          Return to Restaurants
          </Button>
        </Col>
      </Row>
    </>
  );
}

export default BookingsList;


