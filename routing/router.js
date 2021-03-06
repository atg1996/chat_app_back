const express = require('express');
const router = express.Router();
const AuthorizationController = require('../controllers/authorization-controller');
const ChatController = require('../controllers/chat-controller');


router.post("/messages", ChatController.getMessages);
router.post("/register", AuthorizationController.registerUser);
router.post("/login", AuthorizationController.loginUser);
router.get("/users", ChatController.getUsers);


module.exports = router
