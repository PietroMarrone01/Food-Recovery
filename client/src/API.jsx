import dayjs from "dayjs";

const URL = 'http://localhost:3001/api';

/**
 * Returns the list of all restaurants.
 * Maps the data received from the server into a new object with the desired properties.
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
 * Returns the list of all packages for a specific restaurant using its ID.
 * Maps the data received from the server into a new object with the desired properties.
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
 * Retrieves all bookings of a user.
 * Returns an array of objects representing the bookings, each with the information of all the packages it includes.
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
      packageContents: booking.package_contents,
      packages: booking.packages.map((p) => ({
        packageId: p.id,
        restaurantId: p.restaurant_id,
        restaurantName: p.restaurant_name,
        surprisePackage: p.surprise_package,
        content: p.content, 
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
 * Creates a booking by sending an array of selected package IDs to the server.
 * @param {Array} packageIds - Array of selected package IDs.
 * @param {Array} packageContents - Array of selected package contents (Array of Arrays of objects).
 * @returns {Promise} - Promise that resolves with the server's response on success,
 * otherwise it is rejected with an error object.
 */
export function createBooking(packageIds, packageContents) {
  return new Promise((resolve, reject) => {
    fetch(`${URL}/bookings`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ packageIds, packageContents }),
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
 * Deletes a booking from the server.
 * @param {string} bookingId - The ID of the booking to delete.
 * Returns a Promise that resolves with null if the deletion was successful, otherwise it is 
 * rejected with an error message.
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
 * AUTHENTICATION API 
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

//used in doLogOut in the App.jsx file
async function logOut() {
  await fetch(URL+'/sessions/current', {
    method: 'DELETE', 
    credentials: 'include' 
  });
}

//called in the first useEffect of App.jsx
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
