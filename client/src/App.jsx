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
  
  /** Lista di ristoranti */
  const [restaurants, setRestaurants] = useState([]);

  /** Lista di pacchetti */
  const [packages, setPackages] = useState([]);

  /** Lista dei ristoranti per cui l'utente ha già aggiunto un pacchetto al carrello. Utile per disabilitare bottone "Aggiungi al carrello" 
   * se un altro pacchetto dello stesso ristorante è già stato aggiunto*/
  const [addedRestaurants, setAddedRestaurants] = useState([]);
  
  /** Lista di pacchetti nel carrello + stato per la visualizzazione del carrello*/
  const [cartItems, setCartItems] = useState([]);
  const [showCart, setShowCart] = useState(false);

  /** Lista delle prenotazioni */
  const [bookings, setBookings] = useState([]);

  /** Stati per gestire 
   * - messaggio di successo in caso di prenotazione confermata 
   * - messaggio di avviso + pacchetti già prenotati da evidenziare 
   **/
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [highlightUnavailable, setHighlightUnavailable] = useState(false);


  /** Informazioni sull'utente attualmente connesso. Questo è undefined quando nessun utente è connesso */
  const [user, setUser] = useState(undefined);
  const [loggedIn, setLoggedIn] = useState(false); /** Altro stato, booleano in cui mi si viene detto se c'è un utente loggato o no */

  /** Flag iniziale per il caricamento dell'app */
  const [loading, setLoading] = useState(true);

  const [errorMsg, setErrorMsg] = useState('');

  /** Gestistico in un unico punto tutte le chiamate verso il server */
  function handleError(err) {
    let errMsg = 'Unkwnown error';
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
   * UseEffect aggiuntiva che faccio partire al mount dell'applicazione e che mi controlla, quando ricarico l'applicazione, 
   * se sono già loggato (se c'è già un cookie valido). così evito di dover rifare l'autenticazione. 
   */
  useEffect(()=> {
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

  useEffect(() => {
    API.getAllRestaurants()
      .then(resList => {
        setRestaurants(resList);
        // Loading done
        setLoading(false);
      })
      .catch(e => { 
        handleError(e); 
      } );
  }, []);

  /** Usata per mostrare un messaggio di successo all'utente in seguito alla conferma della prenotazione e farlo scomparire automaticamente. */
  useEffect(() => {
    if (bookingSuccess) {
      const timeout = setTimeout(() => {
        setBookingSuccess(false);
      }, 3000); 
      return () => clearTimeout(timeout);  //gestire la pulizia del timeout nel caso in cui il componente venga smontato o aggiornato prima che il timeout scada.
    }
  }, [bookingSuccess]);
  
  /** Usata per mostrare un messaggio di avviso all'utente in seguito alla prenotazione non andata a buon fine + pacchetti già prenotati da evidenziare*/
  useEffect(() => {
    if (highlightUnavailable) {
      const timeout = setTimeout(() => {
        setHighlightUnavailable(false);
        setCartItems([]);
        setAddedRestaurants([]);
        setShowCart(false);
      }, 5000); 
      return () => clearTimeout(timeout);  //gestire la pulizia del timeout nel caso in cui il componente venga smontato o aggiornato prima che il timeout scada.
    }
  }, [highlightUnavailable]);
   

  /** ---- FUNZIONI PER LA GESTIONE DEL LOGIN ---- */
  const doLogOut = async () => {
    await API.logOut();
    setLoggedIn(false);
    setUser(undefined);
    setCartItems([]);
    setAddedRestaurants([]);
  }
  
  const loginSuccessful = (user) => {
    setUser(user);  //user passato dal server lo tengo in uno stato. memorizzo questa informazione in uno stato
    setLoggedIn(true);
    setCartItems([]);
    setAddedRestaurants([]);
  }


  /** ---- FUNZIONE PER LA VISUALIZZAZIONE DEI PACCHETTI ---- */
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

    /** ---- FUNZIONE PER LA VISUALIZZAZIONE DELLE PRENOTAZIONI ---- 
    const handleEnterBookings = async () => {
      if (loggedIn) {
        try {
          API.getAllBookings()
          .then(b => {
            setBookings(b);
            setLoading(false);
            //console.log(b);
          })
        }
        catch (err) {
          handleError(err)
        }
      }
    };

    */

    const handleEnterBookings = () => {
      setLoading(false);
    }

  /** ---- FUNZIONI PER LA GESTIONE DEL CARRELLO ---- */
  const addToCart = (p) => {
    setCartItems((prevItems) => [...prevItems, p]);
    setAddedRestaurants((prevRestaurants) => [...prevRestaurants, p.restaurantId]);
  };

  const removeFromCart = (p) => {
    setCartItems((prevItems) => prevItems.filter((item) => item.id !== p.id));
    setAddedRestaurants((prevRestaurants) => prevRestaurants.filter((restaurantId) => restaurantId !== p.restaurantId));
  };

  //Funzione chiamata quando vado a rimuovere fino ad un max di 2 tipi di cibo dal pacchetto
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

  //Funzione chiamata quando confermo il carrello
  const handleConfirm = async () => {
    const packageIds = cartItems.map((item) => item.id);
  
    try {
      const response = await API.createBooking(packageIds);
  
      if (Array.isArray(response)) {
        console.log('Alcuni pacchetti non sono più disponibili:', response);
        
        // Aggiorna lo stato cartItems mostrando solo i pacchetti non più disponibili
        const updatedCart = cartItems.filter((item) => response.includes(item.id));
        setCartItems(updatedCart);

        // Evidenzia gli elementi non disponibili per 5 secondi --> fa partire la useEffect
        setHighlightUnavailable(true);

      } else {
        // Prenotazione confermata con successo --> fa partire la useEffect
        setBookingSuccess(true);
  
        // Reset e chiusura del carrello 
        setCartItems([]);
        setAddedRestaurants([]);
        setShowCart(false);
      }
    } catch (error) {
      console.error('Errore durante la conferma del carrello:', error);
      handleError(error);
    }
  };
  

  return (
    <BrowserRouter>
      <Routes>
        <Route path='/' element={ <RestaurantRoute user={user} logout={doLogOut}  errorMsg={errorMsg} resetErrorMsg={()=>setErrorMsg('')}
          loading={loading} setLoading={setLoading} restaurants={restaurants} showPackages={handleEnterStore} 
          cartItems = {cartItems} showCart={showCart} setShowCart={setShowCart}
          removeFromCart={removeFromCart} updateCart={updateCart} handleConfirm={handleConfirm} highlightUnavailable={highlightUnavailable}
          showBookings={handleEnterBookings} bookingSuccess={bookingSuccess}/> } />
        
        <Route path='/restaurants/:resId' element={ <PackageRoute user={user} logout={doLogOut} errorMsg={errorMsg} resetErrorMsg={()=>setErrorMsg('')} 
          loading={loading} setLoading={setLoading} packages={packages} 
          cartItems = {cartItems} showCart={showCart} setShowCart={setShowCart}
          addToCart={addToCart} removeFromCart={removeFromCart} updateCart={updateCart} handleConfirm={handleConfirm} highlightUnavailable={highlightUnavailable}
          addedRestaurants={addedRestaurants}
          showBookings={handleEnterBookings}/> } />
        
        <Route path='/bookings' element={ <BookingRoute user={user} logout={doLogOut} errorMsg={errorMsg} 
          resetErrorMsg={()=>setErrorMsg('')} loading={loading} bookings={bookings}
          cartItems = {cartItems} showCart={showCart} setShowCart={setShowCart}
          removeFromCart={removeFromCart} updateCart={updateCart} handleConfirm={handleConfirm} highlightUnavailable={highlightUnavailable}/> } />

        <Route path='/login' element={loggedIn? <Navigate replace to='/' />:  <LoginForm loginSuccessful={loginSuccessful} />} />

        <Route path='/*' element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}


export default App
