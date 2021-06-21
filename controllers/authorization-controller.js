const mysql = require('../sql');
const jwt = require('jsonwebtoken');
const Validator = require('validatorjs');
const AuthorisationManager = require('../managers/authorization-manager');
const bcrypt = require('bcrypt');



module.exports = {

    registerUser: async (req, res) => {
        try {
            const name = req.body.fullName;
            const username = req.body.username;
            const password = req.body.password;
            const data = {
                name: req.body.fullName,
                username: req.body.username,
                password: req.body.password,
            };

            const rules = {
                name: 'required',
                username: 'required',
                password: 'required',
            };

            const validation = new Validator(data, rules);

            if (validation.fails()) {
                return res.status(400).json({message: 'Invalid data.'});
            }
            // TODO: You are not allowed to store the password in a clear format, use hashing.  Use a library called bcrypt.
            const results = await AuthorisationManager.getUserByName(username);
            if (results.length > 0) {
                await res.status(400).json({message: 'Username already exists.'});
            } else {
                await AuthorisationManager.registerUser(name, username, password);
                await res.json(200);
            }
        } catch (e) {
            await res.status(400).json({message: e.message});
        }
    },

    loginUser: async (req, res) => {
        try {
            let username = req.body.username;
            let password = req.body.password;

            if (username && password) {
                const result = await  AuthorisationManager.getByNameAndPassword(username);
                const match = await bcrypt.compare(password, result[0].pass);

                if (match === false) {
                    return res.status(401).json({success:false, message: 'Unauthorized.'});
                }
                const token = await jwt.sign({userID: result[0].id}, 'chat-app', {expiresIn: '10h'});
                if (result.length > 0) {
                    if (result.length === 1) {
                        let user = result[0];

                        await res.status(200).json({
                            success: true,
                            token: token,
                            user_id: user.id
                        });
                    } else {
                        // TODO: Derive from Error and create a class called InternalException
                        throw new Error("Internal exception");
                    }
                } else {
                    return res.status(400).json({success: false, message: 'Unauthorized.'});
                }
            } else {
                await res.status(400).json({success:false, message: 'Invalid arguments.'});
            }
        } catch (e) {
            await res.status(400).json({success:false, message: e.message});
        }

    },

}
