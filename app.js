const express = require('express')
const mustacheExpress = require('mustache-express');
const https = require("https");
const http = require("http");
const querystring = require('querystring');
var url = require('url');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
var request = require('request');
var requestFilter = {};

//Entity
var userController = {};
var loginController = {};
var appController = {};
//DB
var mongoUtil = require("./DBClient/MongoUtil.js")
mongoUtil.connectToServer(function (err) {
    if (err) {
        console.log(err);
        return;
    }
    console.log("Connect DB success!")
    app.listen(port, () => console.log(`Example app listening at http://localhost:${port}`))
    initController();


});

function initController() {
    let DAOImplObject = require('./DAOImpl/DAOImplObject.js');
    DAOImplObject.initDaoImpl();

    let UserController = require("./Controller/UserController.js");
    let LoginController = require("./Controller/LoginController.js");
    userController = new UserController();
    loginController = new LoginController();
    appController = require("./Controller/AppController.js");
    requestFilter = require("./Filter/Filter.js")


}


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

app.get("/api/logout", (req, resp) => {
    loginController.logout(req, resp);
})

app.get(URI_OAUTH2_CALLBACK, (req, resp) => {
    loginController.execCallbackLogin(req, resp, "http://localhost:3000/oauth2callback")
})

app.all('/*', function (req, resp, next) {//filter
    requestFilter.filterBeforeRequest(req, resp, next);
})

app.get('/', (req, resp) => {
    resp.redirect("/login");
});

app.get(URI_DASHBOARD, (req, resp) => {
    appController.renderDashboardPage(req, resp);
})

/*neutral user*/
app.post("/app/request", (req, resp) => {
    appController.requestApp(req, resp);
})

/*admin*/


app.get("/admin/user/manager", (req, resp) => {
    userController.renderUserManagementPage(req, resp);
})

app.get("/admin/user", (req, resp) => {
    userController.getListUser(req, resp);
})

app.get("/user/detail", (req, resp) => {
    userController.renderUserDetailPage(req, resp);
});

app.get("/admin/user/detail", (req, resp) => {

});

app.get("/admin/app/request", (req, resp) => {
    appController.renderAdminRequestAppPage(req, resp);
})

app.post("/admin/app/request/decline", (req, resp) => {
    appController.declineAppRequest(req, resp);
})

app.post("/admin/app/request/accept", (req, resp) => {
    appController.acceptAppRequest(req, resp);
})

app.get("/admin/app", (req, resp) => {
    appController.renderAdminAppPage(req, resp);
})

app.get("/admin/app/detail", (req, resp) => {
    appController.renderAdminAppDetailPage(req, resp);
})

app.post("/admin/app/listuser", (req, resp) => {
    appController.getListUserOfApp(req, resp);
})

app.post("/admin/app/listuser/remove", (req, resp) => {
    appController.removeUserOfApp(req, resp);
})

app.get("/test", (req, resp) => {
    console.log(req.query);
})

