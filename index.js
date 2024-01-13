require('dotenv').config();
const express = require('express');
const cors = require('cors');
const proxy = require('express-http-proxy');
const jwt = require("jsonwebtoken");

const app = express();
//app.use(cors());
app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true
}));

app.use(cors({
    origin: 'http://the-library-club-s3.s3-website.eu-north-1.amazonaws.com',
    credentials: true
}));
app.use(express.json());
const UserRole = {
    USER: 'user',
    MODERATOR: 'moderator'
};

function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1]
    if (token == null) {
        return res.sendStatus(401)
    }
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
        if (err) {
            console.log(err)
            return res.sendStatus(403)
        }
        req.user = user
        //console.log(req.user)
        next()
    })
}

function authorizeUser(req, res, next) {
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1]
    if (token == null) {
        return res.sendStatus(401)
    }
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
        if (err) {
            console.log(err)
            return res.sendStatus(403)
        }
        req.user = user
        if (user.role === UserRole.MODERATOR) {
            next()
        } else {
            return res.sendStatus(403)
        }
    })
}


//authentication
app.use('/authentication', proxy('http://a08eeeb545a564ac995465cc8884d1a9-603373734.eu-north-1.elb.amazonaws.com:8001'));

//posts
app.use('/posts', authenticateToken, proxy('http://ad433771d77144427a0f9f307cd2e23f-1031396011.eu-north-1.elb.amazonaws.com:8002', {
    proxyReqOptDecorator: function (proxyReqOpts, srcReq) {
        proxyReqOpts.headers['user'] = JSON.stringify(srcReq.user);
        return proxyReqOpts;
    }
}));

//reviews
app.use('/reviews', authenticateToken, proxy('http://localhost:8003', {
    proxyReqOptDecorator: function (proxyReqOpts, srcReq) {
        proxyReqOpts.headers['user'] = JSON.stringify(srcReq.user);
        console.log("APIGATEWAYREVIEWs")
        return proxyReqOpts;
    }
}));

//moderator
app.use('/moderator', authorizeUser, proxy('http://a8a47aeffe52d4e9ca5259b278c02eda-874056980.eu-north-1.elb.amazonaws.com:8004', {
    proxyReqOptDecorator: function (proxyReqOpts, srcReq) {
        proxyReqOpts.headers['user'] = JSON.stringify(srcReq.user);
        return proxyReqOpts;
    }
}));

app.use('/', (req, res, next) => {
    return res.status(200).json({ "msg": "Hello from API" })
});

app.listen(8000, () => {
    console.log('API gateway is listening to port 8000')
});

module.exports = app;