import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import dayjs from 'dayjs';
import { React, useEffect, useState, useContext } from 'react';
import { BrowserRouter, Routes, Route, Link, Navigate, Outlet, useNavigate, useParams } from 'react-router-dom';
import { Col, Container, Row, Spinner, Button, Form, Table, Toast } from 'react-bootstrap';
import API from './API';
import {LoginForm} from './components/Miscellaneous';
import {RestaurantRoute, PackageRoute, NotFoundPage} from './components/Routes';
//import './App.css'


function App() {
  
  /** Lista di ristoranti */
  const [restaurants, setRestaurants] = useState([]);

  /** Lista di pacchetti */
  const [packages, setPackages] = useState([]); 

  /** Informazioni sull'utente attualmente connesso. Questo è undefined quando nessun utente è connesso */
  const [user, setUser] = useState(undefined);
  const [loggedIn, setLoggedIn] = useState(false); /** Altro stato, booleano in cui mi si viene detto se c'è un utente loggato o no */

  /**
   * Il carrello prima di qualsiasi modifica locale.
   * Questo è un oggetto come {fullTime: bool, courses: ["..."]}.  ??
   * In qualsiasi momento, l'utente segna il piano di studio corrente come modificato rispetto a quello salvato.  ??
   */
  const [savedCarrello, setSavedCarrello] = useState(undefined);

  /** Flag iniziale per il caricamento dell'app */
  const [loading, setLoading] = useState(true);

  /** Ricarico dal server tutte le volte che i dati possono essere potenzialmente "sporchi", ossia non aggiornati. */ 
  const [dirty, setDirty] = useState(true);


  const [errorMsg, setErrorMsg] = useState('');

  /** Gestistico in un unico punto tutte le chiamate verso il server */
  function handleError(err) {
    console.log('err: '+JSON.stringify(err));  // Only for debug
    let errMsg = 'Unkwnown error';
    if (err.errors) {
      if (err.errors[0])
        if (err.errors[0].msg)
          errMsg = err.errors[0].msg;
    } else if (err.error) {
      errMsg = err.error;
    }

    setErrorMsg(errMsg);
    setTimeout(()=>setDirty(true), 2000);  // Fetch correct version from server, after a while
  }

  /** 
   * UseEffect aggiuntiva che faccio partire al mount dell'applicazione e che mi controlla, quando ricarico l'applicazione, 
   * se sono già loggato (se c'è già un cookie valido). così evito di dover rifare l'autenticazione. 
   */
  useEffect(()=> {
    const checkAuth = async() => {
      try {
        // here you have the user info, if already logged in
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
    // Load the list of courses and number of students enrolled from the server
    API.getAllRestaurants()
      .then(resList => {
        setRestaurants(resList);
        // Loading done
        setLoading(false);
        setDirty(false);  
      })
      .catch(e => { 
        handleError(e); 
      } );
  }, [dirty]);

   //dovrei inserire anche una useEffect che ricarica ogni volta che confermiamo il carrello. infatti ci saranno pacchetti che diventeranno non disponibili. qua farò dipendere la mia useEffect da dirty
   

  /** ---- FUNZIONI PER LA GESTIONE DEL LOGIN ---- */
  const doLogOut = async () => {
    await API.logOut();
    setLoggedIn(false);
    setUser(undefined);
  }
  
  const loginSuccessful = (user) => {
    setUser(user);  //user passato dal server lo tengo in uno stato. memorizzo questa informazione in uno stato
    setLoggedIn(true);
    setDirty(true);  // load latest version of data
  }
  /** ---- FUNZIONI PER LA GESTIONE DEL LOGIN ---- */


  const handleEnterStore = async (id) => {
    if (loggedIn) {
      try {
        API.getPackagesForRestaurant(id)
        .then(p => {
          setPackages(p);
          setLoading(false);
          console.log(p);
        })
      }
      catch (err) {
        handleError(err)
      }
    }
  };

  return (
    <BrowserRouter>
      <Routes>
        <Route path='/' element={ <RestaurantRoute user={user} logout={doLogOut} 
          errorMsg={errorMsg} resetErrorMsg={()=>setErrorMsg('')}
          loading={loading} restaurants={restaurants} showPackages={handleEnterStore} setLoading={setLoading}/> } />
        
        <Route path='/restaurants/:resId' element={ <PackageRoute user={user} logout={doLogOut} 
          errorMsg={errorMsg} resetErrorMsg={()=>setErrorMsg('')}
          loading={loading} restaurants={restaurants} packages={packages}/> } />

        <Route path='/login' element={loggedIn? <Navigate replace to='/' />:  <LoginForm loginSuccessful={loginSuccessful} />} />

        <Route path='/*' element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}


export default App
