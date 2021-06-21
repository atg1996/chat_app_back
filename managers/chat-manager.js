const StaticData = require('../utils/StaticData');

module.exports = {
    addMessage: async (message, senderId, receiverId) => {
        let connection = await StaticData.DBConnectionPool.getConnection();
        await connection.query('INSERT INTO messages (sender_id, receiver_id, message) VALUES(?, ?, ?)', [
            senderId, receiverId, message
        ]);
        connection.close();
    },

    getMessages: async (userId, receiverId, limit, offset) => {
        let connection = await StaticData.DBConnectionPool.getConnection();
        let result = await connection.query('SELECT * FROM messages WHERE sender_id IN (?, ?) AND receiver_id IN (?, ?) ORDER BY id DESC LIMIT ? OFFSET ?', [
            userId, receiverId, userId, receiverId, limit, offset
        ]);
        connection.close();
        return result;
    },

    getUsers: async (data) => {
        console.log(data);
        let connection = await StaticData.DBConnectionPool.getConnection();
        let result = await connection.query('SELECT id, name FROM users WHERE id <> ? ORDER BY id LIMIT ? OFFSET ?', [
            data.userId, data.limit || 10, data.offset || 0
        ]);
        connection.close();
        return result;
    }
}
