const mysql = require('../sql');

module.exports = {
    addMessage: async (req, res) => {
        const message = req.body.sentMessage;
        const senderID = req.body.sender;
        const receiverID = req.body.receiver;

        await mysql.pool.promise().query('INSERT INTO messages (sender_id, receiver_id, message) VALUES(?, ?, ?)', [senderID, receiverID, message]);

        await res.status(200);
    },

    getMessages: async (req, res) => {
        try {
            const userId = req.body.sender;
            const receiverId = req.body.receiver;
            // TODO: Pagination for the messages !!!
            const results = await mysql.pool.promise().query('SELECT * FROM messages WHERE sender_id IN (?, ?) AND receiver_id IN (?, ?)', [userId, receiverId, userId, receiverId]);

            if (results[0].length > 0) {
                res.status(200).json(results[0]);
            } else {
                res.status(200).json([]);
            }
        } catch (err) {
            console.log(err);
        }
    },
}
