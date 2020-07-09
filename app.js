const express = require('express')
const mustacheExpress = require('mustache-express');
const https = require("https");
const http = require("http");
const querystring = require('querystring');
var url = require('url');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
var request = require('request');

//Entity
const UserController = require("./Controller/UserController.js");
const userController = new UserController();
const LoginController = require("./Controller/LoginController.js");
const loginController = new LoginController();
const appController = require("./Controller/AppController.js")

//DB
var mongoUtil = require("./DBClient/MongoUtil")
mongoUtil.connectToServer(function (err) {
    if (err) {
        console.log(err);
    } else {
        console.log("Connect DB success!")
    }
});

//aws constant
var AWS_DOMAIN_BASE = "https://devlinh.auth.ap-southeast-1.amazoncognito.com"
var AWS_AUTHORIZATION = "/oauth2/authorize"
var AWS_CLIENT_ID = "7luaggvs8svcecsfqd312rq9ji"
var AWS_CLIENT_SECRET = "1phan8h4rd3botl88gtfvrqc6lfpruc45t3not7i336t9ci7h6tc"

//APP setting
const app = express()
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'))
app.use(cookieParser());
app.engine('mustache', mustacheExpress());
app.set('view engine', 'mustache');

//APP constant
const port = process.env.PORT || 3000
const URI_OAUTH2_CALLBACK = "/oauth2callback";
const URI_DASHBOARD = "/dashboard";

var subMap = [];


app.get("/login", (req, resp) => {
    loginController.renderLoginPage(req, resp);
})

app.get("/api/login", (req, resp) => {
    loginController.loginWithAWS(req, resp, "http://localhost:3000/oauth2callback");
    // loginWithAWS(resp);
})

app.get(URI_OAUTH2_CALLBACK, (req, resp) => {
    loginController.execCallbackLogin(req, resp, "http://localhost:3000/oauth2callback")
})

app.all('/*', function (req, resp, next) {//filter
    // let sub = req.cookies.sub;
    // if (sub != undefined && sub != "" && loginController.getSubMap()[sub] == sub) {
    //     next();
    // } else {
    //     resp.clearCookie("sub");
    //     resp.redirect("/login");
    // }
    next();
    // call next() here to move on to next middleware/router
})

app.get('/', (req, resp) => {
    resp.redirect("/login");
});

app.get(URI_DASHBOARD, (req, resp) => {
    appController.renderDashboardPage(req, resp);
})

app.get("/admin/user/manager", (req, resp) => {
    userController.renderUserManagementPage(req, resp);
})

app.get("/admin/user", (req, resp) => {
    userController.getListUser(req, resp);
})

function loginWithAWS(resp) {
    redirect_uri = "http://localhost:3000" + URI_OAUTH2_CALLBACK;
    var url = AWS_DOMAIN_BASE + AWS_AUTHORIZATION + `?response_type=code&client_id=${AWS_CLIENT_ID}&redirect_uri=${redirect_uri}`
    console.log(url)
    resp.redirect(url)
}

function getUserInfo(access_token, resp, callback) {
    request({
        headers: {
            'Authorization': "Bearer " + access_token,
        },
        uri: AWS_DOMAIN_BASE + "/oauth2/userInfo",
    }, function (err, res, body) {
        let params = JSON.parse(body);
        let sub = params.sub;
        resp.cookie('sub', sub);
        subMap[sub] = sub;
        resp.redirect("/dashboard");
    });
}

app.get("/test", (req, resp) => {
    // resp.render('test', { test: 'Alligator' });
    loginController.renderTestPage(req, resp);
})


app.listen(port, () => console.log(`Example app listening at http://localhost:${port}`))

