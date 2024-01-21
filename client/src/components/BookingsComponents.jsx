import React from 'react';
import 'bootstrap-icons/font/bootstrap-icons.css';
import { Button, Table, Row, Col, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';



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
        <ul>
          {booking.packages.map((p) => (
            <li key={`${booking.id}-${p.packageId}`}>
              <strong>Ristorante:</strong> {p.restaurantName} <br />
              <strong>Tipo:</strong> {p.surprisePackage ? 'Sorpresa' : 'Normale'} <br />
              <strong>Prezzo:</strong> {p.price} <br />
              <strong>Dimensione:</strong> {p.size} <br />
              <strong>Data inizio prelievo:</strong> {p.startTime.format('HH:mm')} <br />
              <strong>Data fine prelievo:</strong> {p.endTime.format('HH:mm')}
            </li>
          ))}
        </ul>
      </td>
      <td>
        <Button variant="danger" onClick={() => {
          deleteBooking(booking.id); 
          }} >
          Cancella prenotazione
        </Button>
      </td>
    </tr>
  );
}


function BookingsList(props) {
  const navigate = useNavigate();
  const { bookings, user } = props;

  return (
    <>
      <h2>Elenco Prenotazioni effettuate da {user.name}</h2>
      <Table hover>
        <thead>
          <tr>
            <th>N° prenotazione</th>
            <th>N° pacchetti prenotati</th>
            <th>Dettagli Pacchetti</th>
          </tr>
        </thead>
        <tbody>
          {bookings.map((booking, index) => (
            <BookRow key={booking.id} booking={booking} index={index} user={user} deleteBooking={props.deleteBooking}/>
          ))}
        </tbody>
      </Table>
      <Row className="mt-3">
        <Col>
          <Button variant="secondary" onClick={() => navigate('/')} disabled={!user?.id}>
            Torna ai Ristoranti
          </Button>
        </Col>
      </Row>
    </>
  );
}

export default BookingsList;


