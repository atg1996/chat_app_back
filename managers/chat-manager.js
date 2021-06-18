const mysql = require('../sql');

module.exports = {

    addMessage: async (message, senderId, receiverId) => {
        await mysql.pool.getConnection(((err, connection) => {
            if (err) {
                connection.release();
                throw new Error(err.message);
            }

            connection.query(`INSERT INTO messages (sender_id, receiver_id, message) VALUES("${senderId}", "${receiverId}", "${message}")`, (queryErr, result, fields) => {
                connection.release();
                if (queryErr) {
                    throw new Error(queryErr.message);
                }
            });
        }))
    },

    getMessages: async (userId, receiverId) => {
        return await mysql.pool.promise().query('SELECT * FROM messages WHERE sender_id IN (?, ?) AND receiver_id IN (?, ?)', [userId, receiverId, userId, receiverId]);
    },
}
