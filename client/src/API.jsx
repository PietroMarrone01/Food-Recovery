import dayjs from "dayjs";

const URL = 'http://localhost:3001/api';

/**
 * Restituisce la lista di tutti i ristoranti.
 * Mappa i dati ricevuti dal server in un nuovo oggetto con le proprietà desiderate.
 */
async function getAllRestaurants() {
  const response = await fetch(URL + '/restaurants');
  const restaurants = await response.json();

  if (response.ok) {
    return restaurants.map((restaurant) => ({
      id: restaurant.id,
      name: restaurant.name,
      address: restaurant.address,
      phoneNumber: restaurant.phone_number,
      cuisineType: restaurant.cuisine_type,
      foodCategory: restaurant.food_category,
    }));
  } else {
    throw restaurants;
  }
}

/**
 * Restituisce la lista di tutti i pacchetti per uno specifico ristorante usando il suo ID.
 * Mappa i dati ricevuti dal server in un nuovo oggetto con le proprietà desiderate.
 */
async function getPackagesForRestaurant(restaurantId) {
  const response = await fetch(`${URL}/restaurants/${restaurantId}/packages`, {credentials: 'include',});
  const packages = await response.json();

  if (response.ok) {
    return packages.map((p) => ({
      id: p.id,
      restaurantId: p.restaurant_id,
      restaurantName: p.restaurant_name,
      surprisePackage: p.surprise_package,
      content: p.content,
      price: p.price,
      size: p.size,
      startTime: dayjs(p.start_time),
      endTime: dayjs(p.end_time),
      availability: p.availability,
    }));
  } else {
    throw packages;
  }
}

/**
 * Recupera tutte le prenotazioni di un utente.
 * Ritorna un array di oggetti che rappresentano le prenotazioni, ciascuna con le informazioni di tutti i pacchetti da cui è composta.
 */
async function getAllBookings() {
  const response = await fetch(`${URL}/bookings`, { credentials: 'include' });
  const bookings = await response.json();

  //console.log(bookings);  

  if (response.ok) {
    return bookings.map((booking) => ({
      id: booking.id,
      userId: booking.user_id,
      packageIds: booking.package_ids, 
      packages: booking.packages.map((p) => ({
        packageId: p.id,
        restaurantId: p.restaurant_id,
        restaurantName: p.restaurant_name,
        surprisePackage: p.surprise_package,
        price: p.price,
        size: p.size,
        startTime: dayjs(p.start_time),
        endTime: dayjs(p.end_time),
      })), 
    }));
  } else {
    throw bookings;
  }
}

/**
 * Crea una prenotazione inviando al server un array di ID dei pacchetti selezionati.
 * @param {Array} packageIds - Array di ID dei pacchetti selezionati
 * @returns {Promise} - Promise che si risolve con la risposta del server in caso di successo,
 * altrimenti viene rigettata con un oggetto di errore.
 */
export function createBooking(packageIds) {
  return new Promise((resolve, reject) => {
    fetch(`${URL}/bookings`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ packageIds }),
    })
    .then((response) => {
      if (response.ok) {
        response.json()
          .then((answer) => resolve(answer))
          .catch(() => reject({ error: 'Cannot parse server response.' }));
      } else {
        // Analyze the cause of error
        response.json()
          .then((errorMessage) => reject(errorMessage))
          .catch(() => reject({ error: 'Cannot parse server response.' }));
      }
    })
    .catch(() => reject({ error: 'Cannot communicate with the server.' }));
  });
}

/**
 * Elimina una prenotazione dal server.
 * @param {string} bookingId - L'ID della prenotazione da eliminare.
 * Ritorna una Promise che si risolve con null se l'eliminazione è avvenuta con successo, altrimenti viene 
 * rigettata con un messaggio di errore.
 */
function deleteBooking(id) {
  return new Promise((resolve, reject) => {
    fetch(URL + `/bookings/${id}`, {
      method: 'DELETE',
      credentials: 'include',  
    }).then((response) => {
      if (response.ok) {
        resolve(null);
      } else {
        // analyze the cause of error
        response.json()
          .then((message) => { reject(message); }) // error message in the response body
          .catch(() => { reject({ error: "Impossibile analizzare la risposta del server." }) }); // something else
      }
    }).catch(() => { reject({ error: "Impossibile comunicare con il server." }) }); // connection errors
  });
}


/** 
 * API per AUTENTICAZIONE 
 **/

async function logIn(credentials) {
  let response = await fetch(URL + '/sessions', {
    method: 'POST',
    credentials: 'include', 
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(credentials),
  });
  if (response.ok) {
    const user = await response.json();
    return user;
  } else {
    const errDetail = await response.json();
    throw errDetail.message;
  }
}

//usata in doLogOut in file App.jsx
async function logOut() {
  await fetch(URL+'/sessions/current', {
    method: 'DELETE', 
    credentials: 'include' 
  });
}

//chiamata nella prima useEffect di App.jsx
async function getUserInfo() {
  const response = await fetch(URL+'/sessions/current', {
    credentials: 'include'
  });
  const userInfo = await response.json();
  if (response.ok) {
    return userInfo;
  } else {
    throw userInfo;  // an object with the error coming from the server
  }
}
  
const API = {
    getAllRestaurants, getPackagesForRestaurant, getAllBookings, deleteBooking, createBooking,
    logIn, logOut, getUserInfo
  }; 
  export default API;
