'use strict';
/* Data Access Object (DAO) module for accessing users. faccio accesso al DB solamente per gli utenti*/

const sqlite = require('sqlite3');
const crypto = require('crypto');

// open the database. in questo DB abbiamo tabella users con id, email, name, sale e password
const db = new sqlite.Database('food_db.sqlite', (err) => {
  if(err) throw err;
});

//usata nella passport.deserializeUser per ricavare id da utente
exports.getUserById = (id) => {
  return new Promise((resolve, reject) => {
    const sql = 'SELECT * FROM users WHERE id = ?';  //faccio query solo sulla tabella users
      db.get(sql, [id], (err, row) => {
        if (err) 
          reject(err);
        else if (row === undefined)
          resolve({error: 'User not found.'});
        else {
          // by default, the local strategy looks for "username": not to create confusion in server.js, we can create an object with that property
          const user = {id: row.id, username: row.email, name: row.name}
          resolve(user);  //in user possiamo scriverci quello che vogliamo. in questo caso user che torniamo avrà id, email e nome
        }
    });
  });
};

//usata nella passport.use(new LocalStrategy (set-up Passport)
exports.getUser = (email, password) => {
    return new Promise((resolve, reject) => {
      const sql = 'SELECT * FROM users WHERE email = ?';
      db.get(sql, [email], (err, row) => {  // faccio loggare utente con email
        if (err) { reject(err); }
        else if (row === undefined) { resolve(false); }
        else {
          const user = {id: row.id, username: row.email, name: row.name};
          
          const salt = row.salt;
          crypto.scrypt(password, salt, 32, (err, hashedPassword) => {  //32 è LA LUNGHEZZA DELL'HASH DELLA PASSWORD. SE VOGLIAMO HASH PIU' LUNGO DOBBIAMO MODIFICARE QUESTO NUMERO QUI
            if (err) reject(err);

            const passwordHex = Buffer.from(row.password, 'hex');

            if(!crypto.timingSafeEqual(passwordHex, hashedPassword))
              resolve(false);
            else resolve(user);   //questo user poi lo mandiamo al client
          });
        }
      });
    });
  };
