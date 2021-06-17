const path = require('path');
const mysql = require('mysql2');
const express = require('express');
const session = require('express-session');
const cors = require('cors');
const bp = require("body-parser");
const request = require('request');
const jwt = require('jsonwebtoken');
const expressJwt = require('express-jwt');

// TODO: Use environment file for storing the properties such as below (HTTP_PORT).  You may consider using a YAML format for storing the properties
const port = 3000

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

// TODO: Investigate and use mysql connection pooling here
const connection = mysql.createConnection({
    // TODO: Same here, move all environment constants to a environment file
    host: 'sql11.freemysqlhosting.net',
    user: 'sql11419653',
    password: 'ftpgF1nGeq',
    database: 'sql11419653'
});

app.post('/message', async (req, res) => {
    console.log(req.body);
    const message = req.body.sentMessage;
    const senderID = req.body.sender;
    const receiverID = req.body.receiver;
    await connection.connect();
    // TODO: Variable is not used.  Do not declare variables when you are not using them.
    const result = await connection.promise().query('INSERT INTO messages (sender_id, receiver_id, message) VALUES(?, ?, ?)', [senderID, receiverID, message]);
    // DB connection is not closed.
    await res.json(200);
});

app.post("/register", async (req, res) => {
    try {
        // TODO: Validations are missing
        // TODO: Use validatorjs
        const name = req.body.fullName;
        const username = req.body.username;
        const password = req.body.password;

        // TODO: You are not allowed to store the password in a clear format, use hashing.  Use a library called bcrypt.
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

        // TODO: DO not open connection until you are sue its the right time to open it.
        await connection.connect();
        if (username && password) {
            // TODO: Same here, use password hashing for searching it in the DB
            const results = await connection.promise().query('SELECT * FROM users WHERE username = ? AND pass = ?', [username, password]);
            const token = await jwt.sign({userID: results[0].id}, 'chat-app', {expiresIn: '10h'});
            // TODO: results may be missing.  Meaning, no users are found and here the results[0] won't exist
            let rows = results[0];
            console.log(rows.length);
            if(rows.length > 0) {
                if(rows.length === 1) {
                    let user = results[0][0];
                    // TODO: In the case when there are many users this method won't work.  Use a technique called pagination.  Investigate how to do this.
                    const usernames = await connection.promise().query('SELECT id, name FROM users WHERE id <> ?', [user.id]);
                    if (usernames[0].length > 0) {
                        await res.json(200, {
                            success: true,
                            token: token,
                            usernames: usernames[0],
                            user_id: user.id
                        });
                    } else {
                        await res.json(401, {message: 'Unauthorized.'});
                    }
                } else {
                    // TODO: Derive from Error and create a class called InternalException
                    throw new Error("Internal exception");
                }
            } else {
                // TODO: Always used unified format for retuninrg the results.  Meaning if success is used here then use it eevrywhere or don't use it here.
                return res.json(400, {success: false, message: 'Unauthorized.'});
            }
        } else {
            await res.json(400, {message: 'Invalid arguments.'});
        }
    } catch (e) {
        await res.json(400, {message: e.message});
    }

});


app.get("/profile", async (req, res) => {
    const token = req.headers['x-access-token'];
    // TODO: Do not create a DB connection until you make sure that all the variables are validated and you are ready to open the connection now.
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
    try {
        const userId = req.body.sender;
        const receiverId = req.body.receiver;
        // TODO: Pagination for the messages !!!
        const results = await connection.promise().query('SELECT * FROM messages WHERE sender_id IN (?, ?) AND receiver_id IN (?, ?)', [userId, receiverId, userId, receiverId]);
        if (results[0].length > 0) {
            res.json(200, results[0]);
        } else {
            res.json(200, []);
        }
    }catch(err) {
        console.log(err);
    }
})



app.listen(port, '127.0.0.1', () => {
    console.log("Express server listening on port " + port);
});

