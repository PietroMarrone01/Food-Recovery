import { BrowserRouter, Routes, Route, Link, Navigate, Outlet, useNavigate, useParams } from 'react-router-dom';
import { Col, Container, Row, Spinner, Button, Form, Table, Toast, Alert } from 'react-bootstrap';
import { MainRestaurants } from './RestaurantsComponents';
import PackagesList from './PackagesComponents'
import {NavHeader} from './Miscellaneous';


/**
 * Uno spinner di caricamento mostrato durante il primo caricamento dell'app
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


/** Informs the user that the route is not valid */
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

function RestaurantRoute(props) {
    return (
      <>
      <NavHeader user={props.user} logout={props.logout} />  
      <Container fluid>
          {props.errorMsg? 
          <Alert variant='danger' dismissible className='my-2' onClose={props.resetErrorMsg}> {props.errorMsg}</Alert> : null}
          {props.loading ? 
          <LoadingSpinner /> : <MainRestaurants user={props.user} restaurants={props.restaurants} showPackages={props.showPackages} setLoading={props.setLoading}/> }
        </Container>
      </>
        
      
    );
}


function PackageRoute(props) {
  return (
    <>
    <NavHeader user={props.user} logout={props.logout} />  
    <Container fluid>
        {props.errorMsg? 
        <Alert variant='danger' dismissible className='my-2' onClose={props.resetErrorMsg}> {props.errorMsg}</Alert> : null}
        {props.loading ? 
        <LoadingSpinner /> : <PackagesList user={props.user} packages={props.packages} loading={props.loading}/> }
      </Container>
    </>
      
    
  );
}

export {RestaurantRoute, LoadingSpinner, PackageRoute, NotFoundPage} ;