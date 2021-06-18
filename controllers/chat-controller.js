const ChatManager = require('../managers/chat-manager');
const Validator = require('validatorjs');

module.exports = {
    addMessage: async (req, res) => {
        const message = req.body.sentMessage;
        const senderId = req.body.sender;
        const receiverId = req.body.receiver;

        const validation = new Validator({senderId, receiverId, message}, {
            senderId: 'integer|required',
            receiverId: 'integer|required',
            message: 'required'
        });

        if (validation.fails()) {
            return res.status(400).json({success: false, message: 'Invalid data.'});
        }

        try {
            await ChatManager.addMessage(message, senderId, receiverId);
        } catch (e) {
            res.status(404).json({success: false, message: 'Internal Error'});
        }


        return res.status(200);
    },

    getMessages: async (req, res) => {
        try {
            const userId = req.body.sender;
            const receiverId = req.body.receiver;

            const validation = new Validator({userId, receiverId}, {
                userId: 'integer|required',
                receiverId: 'integer|required',
            });

            if (validation.fails()) {
                return res.status(400).json({success: false, message: 'Invalid data.'});
            }

            // TODO: Pagination for the messages !!!
            const results = await ChatManager.getMessages(userId, receiverId);

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
