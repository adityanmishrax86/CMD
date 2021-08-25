const express = require("express");
const app = express();
const { auth } = require('express-openid-connect');
const { requiresAuth } = require('express-openid-connect');
const jwt = require("express-jwt");
const jwksRsa = require("jwks-rsa");
const cors = require("cors");
const morgan = require("morgan");
const helmet = require("helmet");
const post = require("./models/post.model");
const m = require('./helpers/middlewares')
const bodyParser = require('body-parser');

require("dotenv").config();

const config = {
    authRequired: false,
    auth0Logout: true,
    secret: process.env.AUTH0_SECRET,
    baseURL: process.env.AUTH0_BASE_URL,
    clientID: process.env.AUTH0_CLIENT_ID,
    issuerBaseURL: process.env.AUTH0_ISSUER_BASE_URL
};


const authorizeAccessToken = jwt({
    secret: jwksRsa.expressJwtSecret({
        cache: true,
        rateLimit: true,
        jwksRequestsPerMinute: 5,
        jwksUri: process.env.JWT_JWKS_URI
    }),
    audience: process.env.JWT_AUDIENCE,
    issuer: process.env.JWT_ISSUER,
    algorithms: ["RS256"]
});

app.use(auth(config));

// auth router attaches /login, /logout, and /callback routes to the baseURL
app.use(morgan("dev"));
app.use(helmet());
app.use(cors());
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
app.use(bodyParser.json())



app.get("/status", authorizeAccessToken, function (req, res) {
    res.status(200).send('Success')
})

// app.get("/", function (req, res) {
//     res.status(200).send(req.oidc.isAuthenticated() ? 'Logged in' : 'Logged out')
// })

app.get("/posts", authorizeAccessToken, async (req, res) => {
    await post.getPosts()
        .then(posts => res.json(posts))
        .catch(err => {
            if (err.status) {
                res.status(err.status).json({ message: err.message })
            } else {
                res.status(500).json({ message: err.message })
            }
        })
})

app.get("/posts/:id", authorizeAccessToken, m.mustBeInteger, async (req, res) => {
    const id = req.params.id
    await post.getPost(id)
        .then(post => res.json(post))
        .catch(err => {
            if (err.status) {
                res.status(err.status).json({ message: err.message })
            } else {
                res.status(500).json({ message: err.message })
            }
        })
})

app.post("/post", authorizeAccessToken, m.checkFieldsPost, async (req, res) => {
    await post.insertPost(req.body)
        .then(post => res.status(201).json({
            message: `The post #${post.id} has been created`,
            content: post
        }))
        .catch(err => res.status(500).json({ message: err.message }))
})

app.listen(8080, () => {
    console.log("listening on 8080...");
})