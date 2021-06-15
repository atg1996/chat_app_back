const path = require('path');
const mysql = require('mysql2');
const express = require('express');
const session = require('express-session');
const cors = require('cors');
const bp = require("body-parser");
const request = require('request');
const jwt = require('jsonwebtoken');
const expressJwt = require('express-jwt');

const port = 8000

const app = express();

app.use(session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true
}));
app.use(bp.urlencoded({extended: true}));
app.use(bp.json());
app.use(bp.urlencoded({extended: false}))
app.use(bp.json())
app.use(cors())
app.use(require("morgan")("dev"))

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'innorise2021',
    database: 'chat'
});

app.post('/message', async (req, res) => {
    console.log(req.body);
    const message = req.body.sentMessage;
    const senderID = req.body.sender;
    const receiverID = req.body.receiver;
    await connection.connect();
    const result = await connection.promise().query('INSERT INTO messages (sender_id, receiver_id, message) VALUES(?, ?, ?)', [senderID, receiverID, message]);
    await res.json(200);
});

app.post("/register", async (req, res) => {
    try {
        const name = req.body.fullName;
        const username = req.body.username;
        const password = req.body.password;

        await connection.connect();
        const results = await connection.promise().query('SELECT * FROM users WHERE username = ?', [username]);
        if (results[0].length > 0) {
            await res.json(400, {message: 'Username already exists.'});
        } else {
            await connection.promise().query('INSERT INTO users (name, username,pass) VALUES(?, ?, ?)', [name, username, password]);
            await res.json(200);
        }
    } catch (e) {
        await res.json(400, {message: e.message});
    }
});

app.post("/login", async (req, res) => {
    try {
        let username = req.body.username;
        let password = req.body.password;

        await connection.connect();
        if (username && password) {
            const results = await connection.promise().query('SELECT * FROM users WHERE username = ? AND pass = ?', [username, password]);
            const token = await jwt.sign({userID: results[0].id}, 'chat-app', {expiresIn: '10h'});
            const usernames = await connection.promise().query('SELECT id, name FROM users WHERE id != ?', [results[0][0].id]);
            if (results[0].length > 0) {
                await res.json(200, {token: token, usernames: usernames[0], user_id: results[0][0].id});
            } else {
                await res.json(401, {message: 'Unauthorized.'});
            }
        } else {
            await res.json(400, {message: 'Invalid arguments.'});
        }
    }catch (e) {
        await res.json(400, {message: e.message});
    }

});

app.get("/profile", async (req, res) => {
    const token = req.headers['x-access-token'];
    await connection.connect();
    if (!token) {
        res.status(401).send({ auth: false, message: 'No token provided.' });
    }

    const results = await connection.promise().query('SELECT * FROM users WHERE id = ?', [userId]);
    console.log(results);
    if (results[0].length > 0) {
        res.json(200, {id: results[0].id, username: results[0].username, name: results[0].name});
    } else {
        res.json(401, {message: 'Unauthorized.'});
    }

});

app.post("/messages", async (req,res) => {
    const userId = req.body.sender;
    const receiverId = req.body.receiver;
    const results = await connection.promise().query('SELECT * FROM messages WHERE sender_id IN (?, ?) AND receiver_id IN (?, ?)', [userId, receiverId, userId, receiverId]);
    console.log(results);
    if (results[0].length > 0) {
        res.json(200, results[0]);
    } else {
        res.json(200, []);
    }
})



app.listen(port, '192.168.1.22', () => {
    console.log("Express server listening on port " + port);
});

