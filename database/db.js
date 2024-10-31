// Use the MariaDB Node.js Connector
let mariadb = require('mariadb');
 
// Create a connection pool
let pool = 
  mariadb.createPool({
    host: "localhost", //add the ip of remote
    port: 3306,
    user: "root", 
    password: "root",
    database: "modem_manager" 
  });
 
// Expose a method to establish connection with MariaDB SkySQL
module.exports = Object.freeze({
  pool: pool
});