'use strict';
/* Data Access Object (DAO) module for accessing food-related data */

const sqlite = require('sqlite3');
const dayjs = require('dayjs');

// open the database
const db = new sqlite.Database('food_db.sqlite', (err) => {
  if(err) throw err;
});

/** Get all restaurants */ 
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


/** Get packages for a specific restaurant */
exports.listPackagesForRestaurant = (restaurantId) => {
  return new Promise((resolve, reject) => {
    const sql = 'SELECT * FROM packages WHERE restaurant_id = ?';
    db.all(sql, [restaurantId], (err, rows) => {
      if (err) {
        reject(err);
        return;
      }
      const packages = rows.map((p) => ({
        id: p.id,
        restaurant_id: parseInt(p.restaurant_id),
        restaurant_name: p.restaurant_name,
        surprise_package: parseInt(p.surprise_package),
        content: p.content ? JSON.parse(p.content) : null,
        price: p.price,
        size: p.size,
        start_time: dayjs(p.start_time),
        end_time: dayjs(p.end_time),
        availability: parseInt(p.availability),
      }));
      //console.log('answers: '+JSON.stringify(packages));
      resolve(packages);
    });
  });
};


/** Get all bookings for a user */
exports.listBookingsForUser = (userId) => {
  return new Promise((resolve, reject) => {
    const sql = `
    SELECT bookings.id AS booking_id, 
       bookings.user_id, 
       bookings.package_ids,
       bookings.package_contents, 
       packages.id AS package_id,
       packages.restaurant_id,
       packages.restaurant_name,
       packages.surprise_package,
       packages.content,
       packages.price,
       packages.size,
       packages.start_time,
       packages.end_time
    FROM bookings
    JOIN packages ON ',' || bookings.package_ids || ',' LIKE '%,' || packages.id || ',%'
    WHERE user_id = ?
    ORDER BY bookings.id ASC;
    `;

    db.all(sql, [userId], (err, rows) => {
      if (err) {
        reject(err);
        return;
      }

      const bookings = [];
      let currentBooking = null;  // keep track of the current reservation as you scroll through the query results

      rows.forEach((row) => {
        // If the current booking does not yet exist or the current booking ID is different from the current row's ID,
        // a new booking is created in currentBooking.
        if (!currentBooking || currentBooking.id !== row.booking_id) {
          currentBooking = {
            id: row.booking_id,
            user_id: row.user_id,

            //split(',') splits package_ids string into an array using comma as separator.
            //I then convert each element to a base 10 integer
            package_ids: row.package_ids.split(',').map(id => parseInt(id, 10)),

            // Parsing the package_contents field. From JSON string it becomes JS object
            package_contents: JSON.parse(row.package_contents), 
            packages: [],
          };
          bookings.push(currentBooking);
        }

        const packageIndex = currentBooking.package_ids.indexOf(row.package_id);

        const packageInfo = {
          id: row.package_id,
          restaurant_id: row.restaurant_id,
          restaurant_name: row.restaurant_name,
          surprise_package: row.surprise_package === 1,
          content: currentBooking.package_contents[packageIndex], // Use the corresponding index of package_ids
          price: row.price,
          size: row.size,
          start_time: dayjs(row.start_time),
          end_time: dayjs(row.end_time),
        };

        //console.log(packageInfo);

        currentBooking.packages.push(packageInfo);
      });

      resolve(bookings);
    });
  });
};


/** 
 * Controlla la disponibilità dei pacchetti. 
 * Ritorna array vuoto se tutti i pacchetti sono disponibili, altrimenti torna gli id dei pacchetti non disponibili 
 **/
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
      
      //restituisce gli id dei pacchetti non disponibili o, se tutti disponibili, ritorna 0
      resolve(unavailablePackages.length > 0 ? unavailablePackages : []);
    });
  });
};


/** Create a new reservation for a user. Set package availability to 0. */
exports.createBooking = (userId, packageIds, packageContents) => {
  return new Promise((resolve, reject) => {
    const sqlInsertBooking = 'INSERT INTO bookings(user_id, package_ids, package_contents) VALUES (?, ?, ?)'; 
    const sqlUpdateAvailability = 'UPDATE packages SET availability = 0 WHERE id = ?';

    // Concatenation of package IDs into a comma-separated string
    const concatenatedPackageIds = packageIds.join(',');

    // Serialize the array of object arrays in JSON format
    const serializedPackageContents = JSON.stringify(packageContents);

    // Carrying out the booking entry
    db.run(sqlInsertBooking, [userId, concatenatedPackageIds, serializedPackageContents], function (err) {
      if (err) {
        reject(err);
        return;
      }

      // Returns the ID of the last reservation entered
      const bookingId = this.lastID;

      // Update availability to 0 for pre-booked packages
      packageIds.forEach((packageId) => {
        db.run(sqlUpdateAvailability, [packageId], (err) => {
          if (err) {
            console.error('Errore durante l\'aggiornamento dell\'availability:', err);
          }
        });
      });

      resolve(bookingId);
    });
  });
};


/** Delete a reservation for a user. Reset package availability to 1. */
exports.deleteBooking = (bookingId, userId) => {
  return new Promise((resolve, reject) => {
    // ID dei pacchetti dalla prenotazione
    const sqlGetPackageIds = 'SELECT package_ids FROM bookings WHERE id = ? AND user_id = ?';
    db.get(sqlGetPackageIds, [bookingId, userId], (err, row) => {
      if (err) {
        reject(err);
        return;
      }

      if (!row) {
        reject(new Error('Booking not found or does not belong to the user'));
        return;
      }

      // I use package IDs as arrays of numbers
      const packageIds = row.package_ids.split(',').map(id => parseInt(id, 10));

      // Update the availability of the packages
      const sqlUpdateAvailability = 'UPDATE packages SET availability = 1 WHERE id IN (' + packageIds.join(',') + ')';
      db.run(sqlUpdateAvailability, function (err) {
        if (err) {
          reject(err);
          return;
        }

        // Delete the reservation
        const sqlDeleteBooking = 'DELETE FROM bookings WHERE id = ? AND user_id = ?';
        db.run(sqlDeleteBooking, [bookingId, userId], function (err) {
          if (err) {
            reject(err);
            return;
          }

          resolve(this.changes);  // Number of rows affected
        });
      });
    });
  });
};


