let mysql = require('mysql2');
let connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'innorise2021',
    database: 'chat'
});

connection.connect(function(err ) {
    if (err) {
        return console.error('error: ' + err.message );
    }

    let createMessages = `create table if not exists messages(
                          id int primary key NOT NULL AUTO_INCREMENT ,
                          sender_id int ,
                          receiver_id int ,
                          message varchar(255) not null
                      )`;


    connection.query(createMessages, function(err, results, fields) {
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
