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
        const userId = req.body.sender;
        const receiverId = req.body.receiver;
        const limit = req.body.limit || 30;
        const offset = req.body.offset || 0;

        const validation = new Validator({userId, receiverId, limit, offset}, {
            userId: 'integer|required',
            receiverId: 'integer|required',
            limit: 'integer|required',
            offset: 'integer|required',
        });

        if (validation.fails()) {
            return res.status(400).json({success: false, message: 'Invalid data.'});
        }

        const results = await ChatManager.getMessages(userId, receiverId, limit, offset);

        if (results.length > 0) {
            res.status(200).json(results);
        } else {
            res.status(200).json([]);
        }
    },
}
