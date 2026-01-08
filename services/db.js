const mysql = require('mysql');
const conn = mysql.createConnection({
 host: "localhost",
 user: "root",
 password: "",
 database: "dubaiprivatetour",
});

conn.connect();
module.exports = conn;