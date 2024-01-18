import React from 'react';
import 'bootstrap-icons/font/bootstrap-icons.css';
import { Button, Table, Row, Col, Alert } from 'react-bootstrap';
import { useState, useContext } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';


// Componente BookRow
function BookRow(props) {
  const { booking } = props;

  return (
    <tr>
      <td>{booking.id}</td>
      <td>{booking.userId}</td>
      <td>{booking.packageIds.join(', ')}</td>
      <td>
        <ul>
          {booking.packages.map((p) => (
            <li key={p.id}>
              <strong>Ristorante:</strong> {p.restaurantName}, {' '}
              <strong>Tipo:</strong> {p.surprisePackage ? 'Sorpresa' : 'Normale'}, {' '}
              <strong>Prezzo:</strong> {p.price}, {' '}
              <strong>Dimensione:</strong> {p.size}, {' '}
              <strong>Data inizio prelievo:</strong> {p.packageStartTime.format('YYYY-MM-DD HH:mm')}, {' '}
              <strong>Data fine prelievo:</strong> {p.packageEndTime.format('YYYY-MM-DD HH:mm')}
            </li>
          ))}
        </ul>
      </td>
    </tr>
  );
}

// Componente BookingsList
function BookingsList(props) {
  const { bookings } = props;

  return (
    <>
      <h2>Elenco Prenotazioni</h2>
      <Table hover>
        <thead>
          <tr>
            <th>ID Prenotazione</th>
            <th>ID Utente</th>
            <th>ID Pacchetti</th>
            <th>Dettagli Pacchetti</th>
          </tr>
        </thead>
        <tbody>
          {bookings.map((booking) => (
            <BookRow key={booking.id} booking={booking} />
          ))}
        </tbody>
      </Table>
    </>
  );
}

export default BookingsList;

