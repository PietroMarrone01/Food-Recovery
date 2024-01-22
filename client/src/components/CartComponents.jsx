import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Link, Navigate, Outlet, useNavigate, useParams } from 'react-router-dom';
import { Button, Modal } from 'react-bootstrap';
import Alert from 'react-bootstrap/Alert';
import '../mycss.css';


function CartItem(props) {
  const { p, cartItems, i, removeFromCart, updateCart, highlightUnavailable } = props;

  const startTime = p.startTime.format('HH:mm');
  const endTime = p.endTime.format('HH:mm');

  /** 
   * Variabile di stato locale per memorizzare il pacchetto aggiornato. 
   * Proprietà removedItems (usata per tenere traccia del numero di tipi di cibo rimossi nel pacchetto) è inizializzata a 0. 
   * e la incremento ogni volta che rimuovo un tipo di cibo dal contenuto del pacchetto.
  */
  const [updatedP, setUpdatedP] = useState(p);

  const renderPackageType = () => {
    return updatedP.surprisePackage ? 'Pacchetto Sorpresa' : 'Pacchetto Normale';
  };

  /** Funzione per la visualizzazione del contenuto del pacchetto nel carrello (che garantisce aggiornamento del contenuto) */
  const renderContent = () => {

    //funzione definita all'interno di renderContent che mi gestisce rimozione dei tipi di cibo
    const handleRemoveType = (index) => {
      // Clona l'oggetto content, rimuovendo l'elemento specificato dall'indice
      const newContent = [...updatedP.content];
      newContent.splice(index, 1);

      // Crea un nuovo oggetto P con il contenuto aggiornato e la proprietà "removedItems" incrementata
      const updatedItem = {
        ...updatedP,
        content: newContent,
        removedItems: updatedP.removedItems + 1,
      };

      // Aggiorna lo stato locale con il nuovo pacchetto e lo stato del carrello, ossia updateCart (presente in App.jsx)
      setUpdatedP(updatedItem);
      updateCart(updatedItem)
    };


    if (updatedP.content && updatedP.content.length > 0) {
      return (
        <ul>
          {updatedP.content.map((item, index) => (
            <li key={index}>
              {item.name} - Quantità: {item.quantity}{' '}
              <Button
                variant="outline-danger"
                size="sm"
                onClick={() => handleRemoveType(index)}
                disabled={updatedP.content.length === 1 || cartItems[i].removedItems >= 2 || highlightUnavailable}
              >
                -
              </Button>
            </li>
          ))}
        </ul>
      );
    } else {
      return 'Contenuto non disponibile';
    }
  };

  //determinare se l'elemento deve essere contrassegnato come non disponibile (per evidenziarlo per 5 secondi).
  const isUnavailable = highlightUnavailable && cartItems.some(item => item.id === p.id);

  return (
    <div className={`d-flex justify-content-between align-items-center mb-2 ${isUnavailable ? 'highlighted' : ''}`}>
      <div>
        <strong>{updatedP.restaurantName}</strong> - {renderPackageType()}
        <div>{renderContent()}</div>
        <div>Prezzo: {updatedP.price}</div>
        <div>Dimensione: {updatedP.size}</div>
        <div>
          Orario prelievo: {startTime} - {endTime}
        </div>
      </div>
      <Button variant="danger" size="sm" onClick={() => removeFromCart(updatedP)} disabled={highlightUnavailable}>
        Rimuovi
      </Button>
    </div>
  );
}


function CartModal(props) {

    const navigate = useNavigate();
    
    const { cartItems, hideCart, removeFromCart, updateCart, handleConfirm, highlightUnavailable  } = props;

    // Calcola il prezzo totale sommando i prezzi di tutti gli elementi nel carrello
    const totalAmount = cartItems.reduce((total, item) => total + item.price, 0);

    return (
      <Modal show={cartItems.length > 0} >
        <Modal.Header >
          <Modal.Title>Il tuo carrello</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {highlightUnavailable? 
          <Alert variant="danger" className="mb-3">
            Prenotazione non confermata. I seguenti pacchetti sono stati nel frattempo prenotati da altri utenti. 
          </Alert> : 
          <Alert variant="warning" className="mb-3">
            E' possibile rimuovere fino ad un massimo di due tipi di cibo per pacchetto. I pacchetti con un solo tipo di cibo rimanente non possono essere svuotati.
          </Alert>}
          {cartItems.map((item, index) => (
            <CartItem key={item.id} p={item} cartItems={cartItems} i={index} removeFromCart={removeFromCart} updateCart={updateCart} highlightUnavailable={highlightUnavailable}/>
          ))}
        </Modal.Body>
        <Modal.Footer>
            <div className="font-weight-bold">Totale: {totalAmount.toFixed(2)}</div>
            <div>
                <Button variant="secondary" onClick={() => hideCart()}>Chiudi</Button>
                <Button variant="primary" onClick={() => {
                  handleConfirm(); 
                  navigate('/'); }} >Conferma</Button>
            </div>
        </Modal.Footer>
      </Modal>
    );
}

function Cart(props) {

    const { cartItems, showCart, setShowCart} = props;
    
    const hideCart = () => {
        setShowCart(false);
      }
  
    return (
      <div className="text-center my-3">
        <Button className="button-light-blue" onClick={() => setShowCart(true)}>
          Visualizza il carrello ({cartItems.length})
        </Button>

        {showCart? <CartModal cartItems={cartItems} hideCart={hideCart} 
        removeFromCart={props.removeFromCart} updateCart={props.updateCart} handleConfirm={props.handleConfirm}
        highlightUnavailable={props.highlightUnavailable}/> : null}
        
      </div>
    );
  }

export default Cart;
