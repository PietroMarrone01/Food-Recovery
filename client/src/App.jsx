import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import dayjs from 'dayjs';
import { React, useEffect, useState, useContext } from 'react';
import { BrowserRouter, Routes, Route, Link, Navigate, Outlet, useNavigate, useParams } from 'react-router-dom';
import { Col, Container, Row, Spinner, Button, Form, Table, Toast } from 'react-bootstrap';
import API from './API';
import {LoginForm} from './components/Miscellaneous';
import {RestaurantRoute, PackageRoute, BookingRoute, NotFoundPage} from './components/Routes';


function App() {
  
/** List of restaurants */
const [restaurants, setRestaurants] = useState([]);

/** List of packages */
const [packages, setPackages] = useState([]);

/** List of restaurants for which the user has already added a package to the cart. Useful for disabling the "Add to cart" button 
 * if another package from the same restaurant has already been added */
const [addedRestaurants, setAddedRestaurants] = useState([]);

/** List of packages in the cart + state for cart visibility */
const [cartItems, setCartItems] = useState([]);
const [showCart, setShowCart] = useState(false);

/** States to manage 
 * - success message in case of confirmed booking --> used in useEffect
 * - warning message + packages already booked to be highlighted --> used in useEffect
 **/
const [bookingSuccess, setBookingSuccess] = useState(false);
const [highlightUnavailable, setHighlightUnavailable] = useState(false);

/** List of bookings */
const [bookings, setBookings] = useState([]);

/** State to manage the reloading of bookings when one is deleted (enters a "dirty" state) */
const [dirty, setDirty] = useState(false);

/** Information about the currently logged-in user. This is undefined when no user is logged in */
const [user, setUser] = useState(undefined);
const [loggedIn, setLoggedIn] = useState(false); /** Another state, boolean, that tells whether a user is logged in or not */

/** Initial flag for app loading */
const [loading, setLoading] = useState(true);

const [errorMsg, setErrorMsg] = useState('');

/** Handle all server calls in a single place */
function handleError(err) {
  let errMsg = 'Unknown error';
  if (err.errors) {
    if (err.errors[0])
      if (err.errors[0].msg)
        errMsg = err.errors[0].msg;
  } else if (err.error) {
    errMsg = err.error;
  }

  setErrorMsg(errMsg);
}

/** 
 * Additional useEffect that runs when the application mounts. It checks, upon reloading the application,
 * if the user is already logged in (if there's already a valid cookie). This way, the user doesn't have to authenticate again.
 */
useEffect(() => {
  const checkAuth = async() => {
    try {
      const user = await API.getUserInfo();
      setLoggedIn(true);
      setUser(user);
    } catch(err) {
      // NO need to do anything: user is simply not yet authenticated
    }
  };
  checkAuth();
}, []);

/**
 * useEffect used to initially load the list of all restaurants.
 */
useEffect(() => {
  API.getAllRestaurants()
    .then(resList => {
      setRestaurants(resList);
      setLoading(false);
    })
    .catch(e => { 
      handleError(e); 
    });
}, []);

/** 
 * Used to display a success message to the user after a booking confirmation and to automatically hide it.
 * The bookingSuccess state is modified by the handleConfirm function when the "confirm cart" button is pressed.
 */
useEffect(() => {
  if (bookingSuccess) {
    const timeout = setTimeout(() => {
      setBookingSuccess(false);
    }, 3000); 
    return () => clearTimeout(timeout);  // Handles clearing the timeout in case the component is unmounted or updated before the timeout expires.
  }
}, [bookingSuccess]);

/** 
 * Used to display a warning message to the user after a failed booking attempt + highlight already booked packages.
 * The highlightUnavailable state is modified by the handleConfirm function when the "confirm cart" button is pressed.
 **/
useEffect(() => {
  if (highlightUnavailable) {
    const timeout = setTimeout(() => {
      setHighlightUnavailable(false);
      setCartItems([]);
      setAddedRestaurants([]);
      setShowCart(false);
    }, 5000); 
    return () => clearTimeout(timeout);  // Handles clearing the timeout in case the component is unmounted or updated before the timeout expires.
  }
}, [highlightUnavailable]);

/**
 * Used to reload the list of bookings when one is deleted.
 */
useEffect(() => {
  if (dirty) {
    API.getAllBookings()
      .then((bookingList) => {
        setBookings(bookingList);  
        setDirty(false);           
        setLoading(false);   
      })
      .catch((err) => handleError(err));
  }
}, [dirty]);
   

/** ---- FUNCTIONS FOR LOGIN MANAGEMENT ---- */
const doLogOut = async () => {
  await API.logOut();
  setLoggedIn(false);
  setUser(undefined);
  setCartItems([]);
  setAddedRestaurants([]);
}

const loginSuccessful = (user) => {
  setUser(user);  // The user passed from the server is stored in a state. I store this information in a state.
  setLoggedIn(true);
  setCartItems([]);
  setAddedRestaurants([]);
}


/** ---- FUNCTION FOR DISPLAYING PACKAGES ---- */
const handleEnterStore = async (id) => {
  if (loggedIn) {
    try {
      API.getPackagesForRestaurant(id)
      .then(p => {
        setPackages(p);
        setLoading(false);
      })
    }
    catch (err) {
      handleError(err)
    }
  }
};

/** ---- FUNCTIONS FOR MANAGING BOOKINGS ---- */
// Shows all bookings
const handleShowBookings = async () => {
  if (loggedIn) {
    try {
      API.getAllBookings()
      .then(b => {
        setBookings(b);
        setLoading(false);
        //.log(b);
      })
    }
    catch (err) {
      handleError(err)
    }
  }
};

// Deletes a booking
const handleDeleteBooking = async (bookingId) => {
  if (loggedIn) {
    try {
      // MAP that adds "status: deleted" only to the row that needs to be deleted. Then I perform the deletion on the DB using API.deleteBooking
      setBookings((oldBookings) => oldBookings.map(e => e.id !== bookingId ? e : Object.assign({}, e, {status: 'deleted'}) ));

      API.deleteBooking(bookingId)
      .then(() => setDirty(true))
    }
    catch (err) {
      handleError(err)
    }
  }
};


/** ---- FUNCTIONS FOR MANAGING THE CART ---- */
const addToCart = (p) => {
  setCartItems((prevItems) => [...prevItems, p]);
  setAddedRestaurants((prevRestaurants) => [...prevRestaurants, p.restaurantId]);
};

const removeFromCart = (p) => {
  setCartItems((prevItems) => prevItems.filter((item) => item.id !== p.id));
  setAddedRestaurants((prevRestaurants) => prevRestaurants.filter((restaurantId) => restaurantId !== p.restaurantId));
};

// Function called when removing up to a maximum of 2 types of food from the package
const updateCart = (newP) => {
  setCartItems((prevItems) => prevItems.map((e) => {
    if (e.id === newP.id) {
      e = newP;
      return newP;
    } else {
      return e;
    }
  }));
}

// Function called when confirming the cart
const handleConfirm = async () => {
  const packageIds = cartItems.map((item) => item.id);
  const packageContents = cartItems.map((item) => item.content);
  //console.log(packageContents);
  try {
    const response = await API.createBooking(packageIds, packageContents);

    // API.createBooking can return either the ID of the confirmed booking or an array with the IDs of the packages that are no longer available
    if (Array.isArray(response)) {
      //console.log('Some packages are no longer available:', response);

      // Update the cartItems state to show only the packages that are no longer available
      const updatedCart = cartItems.filter((item) => response.includes(item.id));
      setCartItems(updatedCart);

      // Highlight the unavailable items for 5 seconds --> triggers the useEffect
      setHighlightUnavailable(true);

    } else {
      // Booking successfully confirmed --> triggers the useEffect
      setBookingSuccess(true);

      // Reset and close the cart
      setCartItems([]);
      setAddedRestaurants([]);
      setShowCart(false);
    }
  } catch (error) {
    console.error('Error during cart confirmation:', error);
    handleError(error);
  }
};
  

  return (
    <BrowserRouter>
      <Routes>
        <Route path='/' element={ <RestaurantRoute user={user} logout={doLogOut}  errorMsg={errorMsg} resetErrorMsg={()=>setErrorMsg('')}
          loading={loading} setLoading={setLoading} restaurants={restaurants} showPackages={handleEnterStore} 
          cartItems = {cartItems} showCart={showCart} setShowCart={setShowCart}
          removeFromCart={removeFromCart} updateCart={updateCart} handleConfirm={handleConfirm} highlightUnavailable={highlightUnavailable} bookingSuccess={bookingSuccess}
          showBookings={handleShowBookings} /> } />
        
        <Route path='/restaurants/:resId' element={ <PackageRoute user={user} logout={doLogOut} errorMsg={errorMsg} resetErrorMsg={()=>setErrorMsg('')} 
          loading={loading} setLoading={setLoading} packages={packages} 
          cartItems = {cartItems} showCart={showCart} setShowCart={setShowCart}
          addToCart={addToCart} removeFromCart={removeFromCart} updateCart={updateCart} handleConfirm={handleConfirm} highlightUnavailable={highlightUnavailable}
          addedRestaurants={addedRestaurants}
          showBookings={handleShowBookings}/> } />
        
        <Route path='/bookings' element={ <BookingRoute user={user} logout={doLogOut} errorMsg={errorMsg} 
          resetErrorMsg={()=>setErrorMsg('')} loading={loading} bookings={bookings} deleteBooking={handleDeleteBooking}
          cartItems = {cartItems} showCart={showCart} setShowCart={setShowCart}
          removeFromCart={removeFromCart} updateCart={updateCart} handleConfirm={handleConfirm} highlightUnavailable={highlightUnavailable}/> } />

        <Route path='/login' element={loggedIn? <Navigate replace to='/' />:  <LoginForm loginSuccessful={loginSuccessful} />} />

        <Route path='/*' element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>

  );
}


export default App
