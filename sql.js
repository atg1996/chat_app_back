const mysql = require('mysql2');

const pool = mysql.createPool({
    host: process.env.SQL_HOST,
    user: process.env.SQL_USER,
    password: process.env.SQL_PASSWORD,
    database: process.env.SQL_DATABASE
});

const getConnection = async function(callback) {
    pool.getConnection(function (err, connection) {
        callback(err, connection);
    });
};

module.exports = {getConnection, pool};
