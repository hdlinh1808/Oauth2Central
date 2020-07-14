const express = require('express')
const mustacheExpress = require('mustache-express');
const https = require("https");
const http = require("http");
const querystring = require('querystring');
var url = require('url');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
var request = require('request');
var requestFilter;

//Config
var config = require("./Config/Config.js")

var logger = require("./Logger/Logger.js")
logger.info("test log info");
logger.error("test log error");

//DB
var mongoUtil = require("./DBClient/MongoUtil.js");
(async () => {
    aa
    await mongoUtil.connectToServer();
    let DAOImplObject = require('./DAOImpl/DAOImplObject.js');
    DAOImplObject.initDaoImpl();
    let UserController = require("./Controller/UserController.js");
    let LoginController = require("./Controller/LoginController.js");
    var userController = new UserController();
    var loginController = new LoginController();
    var appController = require("./Controller/AppController.js");
    var requestFilter = require("./Filter/Filter.js");

    //aws constant
    var awsConfig = config.aws;
    var AWS_DOMAIN_BASE = awsConfig.baseDomain;
    var AWS_AUTHORIZATION = "/oauth2/authorize"
    var AWS_CLIENT_ID = awsConfig.clientId;
    var AWS_CLIENT_SECRET = awsConfig.clientSecret;

    //app domain
    var appDomain = config.appAddr;

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

    app.get("/login", (req, resp) => {
        loginController.renderLoginPage(req, resp);
    })

    app.get("/api/login", (req, resp) => {
        loginController.loginWithAWS(req, resp, appDomain + "/oauth2callback");
        // loginWithAWS(resp);
    })

    app.get("/api/logout", (req, resp) => {
        loginController.logout(req, resp);
    })

    app.get(URI_OAUTH2_CALLBACK, (req, resp) => {
        loginController.execCallbackLogin(req, resp, appDomain + "/oauth2callback")
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

    app.listen(port, () => console.log(`Example app listening at http://localhost:${port}`))
})()
    .catch((err) => {
        logger.error("init app fail!")
        logger.error(err);
    });

