let mysql = require('mysql2');
let connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'innorise2021',
    database: 'chat'
});

// connect to the MySQL server
connection.connect(function(err ) {
    if (err) {
        return console.error('error: ' + err.message );
    }

    let createUsers = `create table if not exists users(
                          id int primary key NOT NULL AUTO_INCREMENT,
                          name varchar(255)not null ,
                          username varchar(255)not null ,
                          pass varchar(255)not null
                      )`;

    connection.query(createUsers, function(err, results, fields) {
        if (err) {
            console.log(err.message);
        }
    });

    connection.end(function(err) {
        if (err) {
            return console.log(err.message);
        }
    });
});
