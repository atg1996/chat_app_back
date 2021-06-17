const express = require('express');
const router = express.Router();
const mysql = require('../sql');
const jwt = require('jsonwebtoken');


router.post('/message', async (req, res) => {
    const message = req.body.sentMessage;
    const senderID = req.body.sender;
    const receiverID = req.body.receiver;

    await mysql.pool.promise().query('INSERT INTO messages (sender_id, receiver_id, message) VALUES(?, ?, ?)', [senderID, receiverID, message]);

    await res.status(200);
});

router.post("/register", async (req, res) => {
    try {
        // TODO: Validations are missing
        // TODO: Use validatorjs
        const name = req.body.fullName;
        const username = req.body.username;
        const password = req.body.password;
        // TODO: You are not allowed to store the password in a clear format, use hashing.  Use a library called bcrypt.
        const results = await mysql.pool.promise().query('SELECT * FROM users WHERE username = ?', [username]);

        if (results[0].length > 0) {
            await res.status(400).json({message: 'Username already exists.'});
        } else {
            await mysql.getConnection(function (err, conn) {
                conn.query('INSERT INTO users (name, username, pass) VALUES(?, ?, ?)', [name, username, password]);
                conn.release();
            });
            await res.json(200);
        }
    } catch (e) {
        await res.status(400).json({message: e.message});
    }
});

router.post("/login", async (req, res) => {
    try {
        let username = req.body.username;
        let password = req.body.password;

        if (username && password) {
            // TODO: Same here, use password hashing for searching it in the DB
            const results = await mysql.pool.promise().query(`SELECT * FROM users WHERE username = "${username}" AND pass = "${password}"`);

            const token = await jwt.sign({userID: results[0].id}, 'chat-app', {expiresIn: '10h'});
            // TODO: results may be missing.  Meaning, no users are found and here the results[0] won't exist
            let rows = results[0];
            if (rows.length > 0) {
                if (rows.length === 1) {
                    let user = results[0][0];
                    // TODO: In the case when there are many users this method won't work.  Use a technique called pagination.  Investigate how to do this.
                    const usernames = await mysql.pool.promise().query('SELECT id, name FROM users WHERE id <> ?', [user.id]);

                    if (usernames[0].length > 0) {
                        await res.status(200).json({
                            success: true,
                            token: token,
                            usernames: usernames[0],
                            user_id: user.id
                        });
                    } else {
                        await res.status(401).json({message: 'Unauthorized.'});
                    }
                } else {
                    // TODO: Derive from Error and create a class called InternalException
                    throw new Error("Internal exception");
                }
            } else {
                // TODO: Always used unified format for retuninrg the results.  Meaning if success is used here then use it eevrywhere or don't use it here.
                return res.status(400).json({success: false, message: 'Unauthorized.'});
            }
        } else {
            await res.status(400).json({message: 'Invalid arguments.'});
        }
    } catch (e) {
        await res.status(400).json({message: e.message});
    }

});


router.get("/profile", async (req, res) => {
    const token = req.headers['x-access-token'];
    // TODO: Do not create a DB connection until you make sure that all the variables are validated and you are ready to open the connection now.
    if (!token) {
        res.status(401).send({auth: false, message: 'No token provided.'});
    }

    const results = await mysql.pool.promise().query('SELECT * FROM users WHERE id = ?', [userId]);

    if (results[0].length > 0) {
        res.status(200).json({id: results[0].id, username: results[0].username, name: results[0].name});
    } else {
        res.status(401).json({message: 'Unauthorized.'});
    }

});

router.post("/messages", async (req, res) => {
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
})

module.exports = router
