'use strict';
/* Data Access Object (DAO) module for accessing food-related data */

const sqlite = require('sqlite3');
const dayjs = require('dayjs');

// open the database
const db = new sqlite.Database('food_db.sqlite', (err) => {
  if(err) throw err;
});

// ottieni tutti i ristoranti
exports.listRestaurants = () => {
  return new Promise((resolve, reject) => {
    const sql = 'SELECT * FROM restaurants';
    db.all(sql, [], (err, rows) => {
      if (err) {
        reject(err);
        return;
      }
      const restaurants = rows.map((restaurant) => ({
        id: restaurant.id,
        name: restaurant.name,
        address: restaurant.address,
        phone_number: restaurant.phone_number,
        cuisine_type: restaurant.cuisine_type,
        food_category: restaurant.food_category,
      }));
      resolve(restaurants);
    });
  });
};


// ottieni i pacchetti per un ristorante specifico
exports.listPackagesForRestaurant = (restaurantId) => {
  return new Promise((resolve, reject) => {
    const sql = 'SELECT * FROM packages WHERE restaurant_id = ?';
    db.all(sql, [restaurantId], (err, rows) => {
      if (err) {
        reject(err);
        return;
      }
      const packages = rows.map((myPackage) => ({
        id: myPackage.id,
        restaurant_id: parseInt(myPackage.restaurant_id),
        restaurant_name: myPackage.restaurant_name,
        surprise_package: parseInt(myPackage.surprise_package),
        content: myPackage.content ? JSON.parse(myPackage.content) : null,
        price: myPackage.price,
        size: myPackage.size,
        start_time: dayjs(myPackage.start_time),
        end_time: dayjs(myPackage.end_time),
        availability: parseInt(myPackage.availability),
      }));
      console.log('answers: '+JSON.stringify(packages));
      resolve(packages);
    });
  });
};


// ottieni tutte le prenotazioni per un utente
exports.listBookingsForUser = (userId) => {
  return new Promise((resolve, reject) => {
    const sql = 'SELECT * FROM bookings WHERE user_id = ?';
    db.all(sql, [userId], (err, rows) => {
      if (err) {
        reject(err);
        return;
      }
      const bookings = rows.map((booking) => ({
        id: booking.id,
        user_id: booking.user_id,
        package_ids: JSON.parse(booking.package_ids), //array di interi e non stringa JSON
      }));
      resolve(bookings);
    });
  });
};


// controlla la disponibilità dei pacchetti. Ritorna 0 se tutti i pacchetti sono disponibili, altrimenti torna gli id dei pacchetti non disponibili
exports.checkPackageAvailability = (packageIds) => {
  return new Promise((resolve, reject) => {

    //placeholders sarà una stringa di segnaposti SQL del tipo ?, ?, ?, ... basata sulla lunghezza dell'array packageIds
    const placeholders = packageIds.map(() => '?').join(', ');
    const sql = `SELECT id, availability FROM packages WHERE id IN (${placeholders}) AND availability = 1`;

    //availablePackages è array dei pacchetti che sono attualmente disponibili (ottenuti da query al db)
    db.all(sql, packageIds, (err, availablePackages) => {  
      if (err) {
        reject(err);
        return;
      }

      //"!availablePackages.some(pkg => pkg.id === id)" ritorna vera se nessun pacchetto in availablePackages ha un ID uguale a id.
      const unavailablePackages = packageIds.filter(id => !availablePackages.some(pkg => pkg.id === id));
      
      //restituisce gli id dei pacchetti non disponibili o, se tutti disponibili, il numero dei pacchetti del carrello
      resolve(unavailablePackages.length > 0 ? unavailablePackages : 0);
    });
  });
};


// Crea una nuova prenotazione per un utente
exports.createBooking = (userId, packageIds) => {
  return new Promise((resolve, reject) => {
    const sql = 'INSERT INTO bookings(user_id, package_ids) VALUES (?, ?)';
    
    // Concatenazione degli ID dei pacchetti in una stringa separata da virgole
    const concatenatedPackageIds = packageIds.join(',');

    // Esecuzione dell'inserimento della prenotazione
    db.run(sql, [userId, concatenatedPackageIds], function (err) {
      if (err) {
        reject(err);
        return;
      }

      // Restituisce l'ID dell'ultima prenotazione inserita
      resolve(this.lastID);
    });
  });
};


// elimina una prenotazione per un utente
exports.deleteBooking = (bookingId, userId) => {
  return new Promise((resolve, reject) => {
    const sql = 'DELETE FROM bookings WHERE id = ? AND userId = ?';
    db.run(sql, [bookingId, userId], function (err) {
      if (err) {
        reject(err);
        return;
      }
      resolve(this.changes);  // Number of affected rows
    });
  });
};
