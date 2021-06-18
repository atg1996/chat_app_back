const StaticData = require('../utils/StaticData');


module.exports = {

    getUserByName: async(username) => {
        let connection = await StaticData.DBConnectionPool.getConnection();
        let result = await connection.query('SELECT * FROM users WHERE username = ?', [username]);
        connection.close()
        return result;
    },


    setByNameAndPassword:async(username, password) => {
        let connection = await StaticData.DBConnectionPool.getConnection();
        let result =  await connection.query('SELECT * FROM users WHERE username =?  AND pass =?' , [username, password]);
        connection.close();
        return result;
    },

    registerUser: async (name, username, password) => {
        let connection = await StaticData.DBConnectionPool.getConnection();
        await connection.query('INSERT INTO users (name, username, pass) VALUES(?, ?, ?)', [
            name, username, password
        ]);
        connection.close();
    },

    loginUsers: async (userId) => {
        let connection = await StaticData.DBConnectionPool.getConnection();
        let result = await connection.query('SELECT id, name FROM users WHERE id <> ?', [userId]);
        connection.close();
        return result;
    }
}
