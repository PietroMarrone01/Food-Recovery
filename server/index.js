'use strict';

const express = require('express');
const morgan = require('morgan'); // logging middleware
const {check, validationResult} = require('express-validator'); // validation middleware
const dao = require('./dao'); // module for accessing the DB

const passport = require('passport'); // auth middleware
const LocalStrategy = require('passport-local').Strategy; // username and password for login
const session = require('express-session'); // enable sessions
const userDao = require('./user-dao'); // module for accessing the user info in the DB
const cors = require('cors');  



/*** Set up Passport ***/
// set up the "username and password" login strategy
// by setting a function to verify username and password
passport.use(new LocalStrategy(
  function(username, password, done) {
    userDao.getUser(username, password).then((user) => {  
      if (!user)
        return done(null, false, { message: 'Incorrect username and/or password.' });  //credenziali non valide
        
      return done(null, user);  //credenziali valide
    })
  }
));

// serialize and de-serialize the user (user object <-> session)
// we serialize the user id and we store it in the session: the session is very small in this way
passport.serializeUser((user, done) => {
  done(null, user.id);  
});

// starting from the data in the session, we extract the current (logged-in) user
passport.deserializeUser((id, done) => {
  userDao.getUserById(id)  //io faccio autenticazione con email e passoword, ma poi quando ho la sesssione ho id dentro la sessione. da id voglio recuperare informazioni dell'utente. 
    .then(user => {
      done(null, user); // this will be available in req.user
    }).catch(err => {
      done(err, null);
    });
});


// init express
const app = express();
const port = 3001;

// set-up the middlewares
app.use(morgan('dev'));
app.use(express.json());

const corsOptions = {
  origin: 'http://localhost:5173',
  credentials: true,
};
app.use(cors(corsOptions)); 

const answerDelay = 1300;

// custom middleware: check if a given request is coming from an authenticated user
const isLoggedIn = (req, res, next) => {
  if(req.isAuthenticated())
    return next();
  
  return res.status(401).json({ error: 'Not authenticated'});
}

// set up the session
app.use(session({
  // by default, Passport uses a MemoryStore to keep track of the sessions
  secret: '586e60fdeb6f34186ae165a0cea7ee1dfa4105354e8c74610671de0ef9662191',   //personalize this random string, should be a secret value.
  resave: false,
  saveUninitialized: false 
}));

// then, init passport
app.use(passport.initialize());
app.use(passport.session());  



/*** APIs ***/

// GET /api/restaurants
app.get('/api/restaurants', async (req, res) => {
  try {
    const restaurants = await dao.listRestaurants();
    if(restaurants.error)
      res.status(404).json(restaurants);
    else
      setTimeout(()=>res.json(restaurants), answerDelay);
  } catch (err) {
    console.log(err);
    res.status(500).end();
  }
});

// GET /api/restaurants/:id/packages - AUTH 
app.get('/api/restaurants/:id/packages', isLoggedIn, async (req, res) => {
  const shopId = req.params.id;
  try {
    const packages = await dao.listPackagesForRestaurant(shopId);
    if(packages.error)
      res.status(404).json(packages);
    else
      setTimeout(()=>res.json(packages), answerDelay);
  } catch (err) {
    console.log(err);
    res.status(500).end();
  }
});

// GET /api/bookings - AUTH 
app.get('/api/bookings', isLoggedIn, async (req, res) => {
  const userId = req.user.id;
  try {
    const bookings = await dao.listBookingsForUser(userId);
    if (bookings.error)
      res.status(404).json(bookings);
    else
      setTimeout(() => res.json(bookings), answerDelay);
  } catch (err) {
    console.log(err);
    res.status(500).end();
  }
});

/** 
// POST /api/booking - AUTH 
app.post('/api/booking', isLoggedIn, [
  body('packageIds').isArray().notEmpty().withMessage('Devi fornire almeno un pacchetto nel carrello.').bail(),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const packageIds = req.body.packageIds;

  try {
    // Controlla la disponibilità dei pacchetti
    const availabilityResult = await dao.checkPackageAvailability(packageIds);

    if (availabilityResult === 0) {
      // Tutti i pacchetti sono disponibili, procedi con la creazione della prenotazione
      const bookingResult = await dao.createBooking(req.user.id, packageIds);
      res.status(201).json(bookingResult);
    } else {
      // Almeno uno dei pacchetti non è disponibile, restituisci un messaggio di errore con gli id dei pacchetti non disponibili
      res.status(400).json({ error: 'Almeno uno dei pacchetti nel carrello non è più disponibile.', unavailablePackages: availabilityResult });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Errore durante la verifica della disponibilità dei pacchetti o la creazione della prenotazione.' });
  }
});
 */

// DELETE /api/booking/:id - AUTH 
app.delete('/api/bookings/:id', isLoggedIn, async (req, res) => {
  const bookingId = req.params.id;
  const userId = req.user.id;

  try {
    const numRowChanges = await dao.deleteBooking(bookingId, userId);
    res.json(numRowChanges);
  } catch (err) {
    console.log(err);
    res.status(503).json({ error: `Database error during the deletion of booking ${bookingId}.` });
  }
});


/*** Users APIs ***/

// POST /sessions 
// login
app.post('/api/sessions', function(req, res, next) {  
  passport.authenticate('local', (err, user, info) => {
    if (err)
      return next(err);
      if (!user) {
        // display wrong login messages
        return res.status(401).json(info);
      }
      // success, perform the login
      req.login(user, (err) => {
        if (err)
          return next(err);
        
        // req.user contains the authenticated user, we send all the user info back
        // this is coming from userDao.getUser()
        return res.json(req.user);
      });
  })(req, res, next);
});


// DELETE /sessions/current 
// logout
app.delete('/api/sessions/current', (req, res) => {
  req.logout( ()=> { res.end(); } );
});

// GET /sessions/current --> ci da informazione se utente è autenticato
// check whether the user is logged in or not
app.get('/api/sessions/current', (req, res) => {  if(req.isAuthenticated()) {
    res.status(200).json(req.user);}
  else
    res.status(401).json({error: 'Unauthenticated user!'});;
});


// activate the server
app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
