const StaticData = require('../utils/StaticData');
const bcrypt = require('bcrypt');
const saltRounds = 5;

module.exports = {

    getUserByName: async (username) => {
        let connection = await StaticData.DBConnectionPool.getConnection();
        let result = await connection.query('SELECT * FROM users WHERE username = ?', [username]);
        connection.close()
        return result;
    },


    getByNameAndPassword: async (username) => {
        let connection = await StaticData.DBConnectionPool.getConnection();
        let result = await connection.query('SELECT * FROM users WHERE username =?', [username]);
        connection.close();
        return result;
    },

    registerUser: async (name, username, password) => {
        await bcrypt.genSalt(saltRounds, async function (err, salt) {
            await bcrypt.hash(password, salt,  async function (err, hash) {
                let connection = await StaticData.DBConnectionPool.getConnection();
                await connection.query('INSERT INTO users (name, username, pass) VALUES(?, ?, ?)', [
                    name, username, hash
                ]);
                connection.close();
            })
        });
    },

    loginUsers: async (userId) => {
        let connection = await StaticData.DBConnectionPool.getConnection();
        let result = await connection.query('SELECT id, name FROM users WHERE id <> ?', [userId]);
        connection.close();
        return result;
    }
}
