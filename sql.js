const mysql = require('mysql2');

class DBConnectionPool {
    constructor() {
        this.pool = mysql.createPool({
            host: process.env.SQL_HOST,
            user: process.env.SQL_USER,
            password: process.env.SQL_PASSWORD,
            database: process.env.SQL_DATABASE
        });
    }

    getConnection() {
        let connectionPool = this.pool;
        return new Promise((resolve, reject) => {
            connectionPool.getConnection(function (err, connection) {
                if(err) {
                    reject(err);
                } else {
                    let conn = new DBConnection(connection);
                    resolve(conn);
                }
            });
        })
    }
}

class DBConnection {
    constructor(connection) {
        this.connection = connection;
    }

    query(sql, values) {
        let conn = this.connection;
        return new Promise((resolve, reject) => {
            conn.query(sql, values, (err, result) => {
                if(err) {
                    reject(err);
                } else {
                    resolve(result);
                }
            })
        })
    }

    close() {
        this.connection.release();
    }
}

module.exports = {DBConnectionPool, DBConnection};
