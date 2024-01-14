import React from 'react';
import 'bootstrap-icons/font/bootstrap-icons.css';
import { Button, Table, Row, Col } from 'react-bootstrap';
import { useState, useContext } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {NavHeader, LoginForm, Restaurant, Package} from './Miscellaneous';

function PackageRow(props) {
  const { p } = props;

  const renderPackageType = () => {
    return p.isSurprisePackage ? 'Pacchetto sorpresa' : 'Pacchetto normale';
  };

  const renderContent = () => {
    if (p.content && p.content.length > 0) {
      // Se ci sono elementi in content, li mostreremo concatenati
      return p.content.map((item, index) => (
        <div key={index}>
          {item.name} - Quantità: {item.quantity}
        </div>
      ));
    } else {
      return 'Non è possibile visualizzare il contenuto';
    }
  };

  const renderAvailability = () => {
    return p.availability ? 'Disponibile' : 'Non Disponibile';
  };

  return (
    <tr>
      <td>{renderPackageType()}</td>
      <td>{renderContent()}</td>
      <td>{p.price}</td>
      <td>{p.size}</td>
      <td>{p.startTime.format('HH:mm')}</td>
      <td>{p.endTime.format('HH:mm')}</td>
      <td>{renderAvailability()}</td>
      <td>
        <Button variant='primary' className='float-end'>
          Aggiungi al carrello
        </Button>
      </td>
    </tr>
  );
}

function PackagesList(props) {

  const navigate = useNavigate();

  const { resId } = useParams();

  const packagesList = props.packages.map((p) => {
    const { id, restaurantId, restaurantName, isSurprisePackage, content, price, size, startTime, endTime, availability } = p;
    return new Package(id, restaurantId, restaurantName, isSurprisePackage, content, price, size, startTime, endTime, availability);
  });

  console.log(packagesList);

  return (
    <>
      <Row>
        <Col className="mt-3">
          <p className='fw-bold'>Pacchetti a disposizione nel ristorante: {packagesList[0].restaurantName}</p>
        </Col>
      </Row>
      <Row>
        <Col>
          <Table hover>
            <thead>
              <tr>
                <th>Tipo pacchetto</th>
                <th>Contenuto</th>
                <th>Prezzo</th>
                <th>Dimensione</th>
                <th>Data inizio prelievo</th>
                <th>Data fine prelievo</th>
                <th>Disponibilità</th>
              </tr>
            </thead>
            <tbody>
              {packagesList.map((p) =>
                <PackageRow p={p} key={p.id} />)
              }
            </tbody>
          </Table>
        </Col>
      </Row>
      <Row className="mb-2">
        <Col>
        <Button variant='secondary' onClick={()=>navigate('/bookings')} disabled={props.user?.id? false : true}> Le mie prenotazioni </Button>
        </Col>
      </Row>
      <Row>
        <Col>
        <Button variant='secondary' onClick={()=>navigate('/')} disabled={props.user?.id? false : true}> Torna ai Ristoranti </Button>
        </Col>
      </Row>
    </>
  )
}

export default PackagesList;
