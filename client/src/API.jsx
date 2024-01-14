import dayjs from "dayjs";

const URL = 'http://localhost:3001/api';

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

async function getAllBookings() {
  const response = await fetch(`${URL}/bookings`, {credentials: 'include',});
  const bookings = await response.json();

  if (response.ok) {
    return bookings.map((booking) => ({
      id: booking.id,
      userId: booking.user_id,
      packageIds: JSON.parse(booking.package_ids),
    }));
  } else {
    throw bookings;
  }
}

//da sistemare

async function createBooking(packageIds) {
  const response = await fetch(`${URL}/booking`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ packageIds }),
  });

  if (response.ok) {
    return await response.json();
  } else {
    throw await response.json();
  }
}




function deleteBooking(bookingId) {
  return new Promise((resolve, reject) => {
    fetch(URL + `/bookings/${bookingId}`, {
      method: 'DELETE',
      credentials: 'include',  
    }).then((response) => {
      if (response.ok) {
        resolve(null);
      } else {
        // analyze the cause of error
        response.json()
          .then((message) => { reject(message); }) // error message in the response body
          .catch(() => { reject({ error: "Cannot parse server response." }) }); // something else
      }
    }).catch(() => { reject({ error: "Cannot communicate with the server." }) }); // connection errors
  });
}


/** API per autenticazione */

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
