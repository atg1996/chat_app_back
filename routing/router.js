const express = require('express');
const router = express.Router();
const authorizationController = require('../controllers/authorization-controller');
const chatController = require('../controllers/chat-controller');


router.post('/message', chatController.addMessage);
router.post("/messages", chatController.getMessages);
router.post("/register", authorizationController.registerUser);
router.post("/login", authorizationController.loginUser);


module.exports = router
