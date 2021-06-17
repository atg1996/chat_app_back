const express = require('express');
const session = require('express-session');
const cors = require('cors');
const bp = require("body-parser");
require('custom-env').env('local');
const router = require('./routing/router');

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
app.use('', router);


app.listen(process.env.HTTP_PORT, '127.0.0.1', () => {
    console.log("Express server listening on port " + process.env.HTTP_PORT);
});

