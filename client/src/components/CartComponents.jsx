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
 * Local state variable to store the updated package. 
 * The removedItems property (used to keep track of the number of types of food removed from the package) is initialized to 0 
 * and is incremented each time a type of food is removed from the package contents.
 */
  const [updatedP, setUpdatedP] = useState(p);

  const renderPackageType = () => {
    return updatedP.surprisePackage ? 'Pacchetto Sorpresa' : 'Pacchetto Normale';
  };

  /** Function for displaying the contents of the package in the cart (which guarantees updating of the content) */
  const renderContent = () => {

    //function defined inside renderContent that handles removing food types
    const handleRemoveType = (index) => {
      // Clona l'oggetto content, rimuovendo l'elemento specificato dall'indice
      const newContent = [...updatedP.content];
      newContent.splice(index, 1);

      // Creates a new object P with updated contents and incremented "removedItems" property
      const updatedItem = {
        ...updatedP,
        content: newContent,
        removedItems: updatedP.removedItems + 1,
      };

      // Update local state with new package and cart state i.e. updateCart (present in App.jsx)
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

  //determine whether the item should be marked as unavailable (to highlight it for 5 seconds).
  const isUnavailable = highlightUnavailable && cartItems.some(item => item.id === p.id);

  return (
    <div className={`d-flex justify-content-between align-items-center mb-2 ${isUnavailable ? 'highlighted' : ''}`}>
      <div>
        <strong>{updatedP.restaurantName}</strong> - {renderPackageType()}
        <div>{renderContent()}</div>
        <div>Price: {updatedP.price}</div>
        <div>Size: {updatedP.size}</div>
        <div>
        Pickup time: {startTime} - {endTime}
        </div>
      </div>
      <Button variant="danger" size="sm" onClick={() => removeFromCart(updatedP)} disabled={highlightUnavailable}>
      Remove
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
          <Modal.Title>Your cart</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {highlightUnavailable? 
          <Alert variant="danger" className="mb-3">
            Reservation not confirmed. The following packages have meanwhile been booked by other users.
          </Alert> : 
          <Alert variant="warning" className="mb-3">
            It is possible to remove up to a maximum of two types of food per package. Packets with only one type of food remaining cannot be emptied.
          </Alert>}
          {cartItems.map((item, index) => (
            <CartItem key={item.id} p={item} cartItems={cartItems} i={index} removeFromCart={removeFromCart} updateCart={updateCart} highlightUnavailable={highlightUnavailable}/>
          ))}
        </Modal.Body>
        <Modal.Footer>
            <div className="font-weight-bold">Total: {totalAmount.toFixed(2)}</div>
            <div>
                <Button variant="secondary" onClick={() => hideCart()}>Close</Button>
                <Button variant="primary" onClick={() => {
                  handleConfirm(); 
                  navigate('/'); }} >Confirm</Button>
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
