import { BrowserRouter, Routes, Route, Link, Navigate, Outlet, useNavigate, useParams } from 'react-router-dom';
import { Col, Container, Row, Spinner, Button, Form, Table, Toast, Alert } from 'react-bootstrap';
import { MainRestaurants } from './RestaurantsComponents';
import PackagesList from './PackagesComponents'
import Cart from './CartComponents'
import BookingsList from './BookingsComponents'
import {NavHeader} from './Miscellaneous';


/**
 * A loading spinner.
 */
function LoadingSpinner() {
    return (
      <div className="position-absolute w-100 h-100 d-flex flex-column align-items-center justify-content-center">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </div>
    );
  }

/** 
 * Informs the user that the route is invalid
 */
function NotFoundPage() {
  return (
    <Container className='App'>
      <h1>No data here...</h1>
      <h2>This is not the route you are looking for!</h2>
      <Link to='/'>
        <Button variant='success'>Please go back to main page</Button>
      </Link>
    </Container>
  )
}

/**
 * Route for displaying restaurants.
 */
function RestaurantRoute(props) {
    return (
      <>
        <NavHeader user={props.user} logout={props.logout} />
        {props.bookingSuccess? ( //print success message if booking is confirmed
        <Alert variant="success" className="my-2 text-center">
          Prenotazione confermata con successo!
        </Alert> ) : null}
        {props.user? //if the user is logged in, show the list of restaurants + the cart
        <Container fluid>
          {props.errorMsg? 
          <Alert variant='danger' dismissible className='my-2' onClose={props.resetErrorMsg}> {props.errorMsg}</Alert> : null}
          {props.loading ? ( <LoadingSpinner /> ) : (<Row>
            <Col md={11}>
              <MainRestaurants user={props.user} restaurants={props.restaurants} showPackages={props.showPackages} setLoading={props.setLoading}
              showBookings={props.showBookings}/>
            </Col>
            <Col md={1}>
              <Cart cartItems = {props.cartItems} showCart={props.showCart} setShowCart={props.setShowCart}
              removeFromCart={props.removeFromCart} updateCart={props.updateCart} handleConfirm={props.handleConfirm}
              highlightUnavailable={props.highlightUnavailable}/>
            </Col>
          </Row>) }
        </Container> : //if user is not logged in I only show list of restaurants
        <Container fluid>
          {props.errorMsg? 
          <Alert variant='danger' dismissible className='my-2' onClose={props.resetErrorMsg}> {props.errorMsg}</Alert> : null}
          {props.loading ? 
          <LoadingSpinner /> : <MainRestaurants user={props.user} restaurants={props.restaurants} showPackages={props.showPackages} setLoading={props.setLoading}/> }
        </Container>
        }
      </>
    );
}

/**
 * Route for viewing packets.
 */
function PackageRoute(props) {
  return (
    <>
    <NavHeader user={props.user} logout={props.logout} />
    <Container fluid>
        {props.errorMsg? 
        <Alert variant='danger' dismissible className='my-2' onClose={props.resetErrorMsg}> {props.errorMsg}</Alert> : null}
          {props.loading ? ( <LoadingSpinner /> ) : 
          (<Row>
            <Col md={11}>
              <PackagesList user={props.user} packages={props.packages} loading={props.loading} setLoading={props.setLoading}
              addToCart={props.addToCart} setShowCart={props.setShowCart} addedRestaurants={props.addedRestaurants}
              showBookings={props.showBookings}/>
            </Col>
            <Col md={1}>
              <Cart cartItems = {props.cartItems} showCart={props.showCart} setShowCart={props.setShowCart}
              removeFromCart={props.removeFromCart} updateCart={props.updateCart} handleConfirm={props.handleConfirm}
              highlightUnavailable={props.highlightUnavailable}/>
            </Col> 
          </Row>) }
      </Container> 
    </>
  );
}

/**
 * Route for viewing reservations.
 */
function BookingRoute(props) {
  return (
    <>
    <NavHeader user={props.user} logout={props.logout} />
    <Container fluid>
        {props.errorMsg? 
        <Alert variant='danger' dismissible className='my-2' onClose={props.resetErrorMsg}> {props.errorMsg}</Alert> : null}
          {props.loading ? ( <LoadingSpinner /> ) : 
          (<Row>
            <Col md={11}>
              <BookingsList user={props.user} bookings={props.bookings} setShowCart={props.setShowCart} deleteBooking={props.deleteBooking}/>
            </Col>
            <Col md={1}>
              <Cart cartItems = {props.cartItems} showCart={props.showCart} setShowCart={props.setShowCart}
              removeFromCart={props.removeFromCart} updateCart={props.updateCart} handleConfirm={props.handleConfirm}
              highlightUnavailable={props.highlightUnavailable}/>
            </Col> 
          </Row>) }
      </Container> 
    </>
  );
}

export {RestaurantRoute, LoadingSpinner, PackageRoute, BookingRoute, NotFoundPage} ;


