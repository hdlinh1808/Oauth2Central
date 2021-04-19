var logger = require("./Logger/Logger.js")(module)
const express = require('express')
const mustacheExpress = require('mustache-express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
logger.info("APP IS STARTING...")
//Config
var config = require("./Config/Config.js")
//DB
var mongoUtil = require("./DBClient/MongoUtil.js");

(async () => {
    await mongoUtil.connectToServer();
    //init impl Dao
    let DAOImplObject = require('./DAOImpl/DAOImplObject.js');
    DAOImplObject.initDaoImpl();

    //init RoleManager
    let RoleManager = require("./Middleware/RoleManager.js");
    RoleManager.init();

    //init Adapter
    require("./Adapter/AdapterManager.js");

    // init Controller
    let UserController = require("./Controller/UserController.js");
    let LoginController = require("./Controller/LoginController.js");
    var userController = new UserController();
    var loginController = new LoginController();
    var appController = require("./Controller/AppController.js");
    var requestFilter = require("./Filter/Filter.js");
    //app domain
    var appDomain = config.appAddr;
    const port = config.port;

    //APP setting
    const app = express()
    app.use(bodyParser.urlencoded({ extended: true }));
    app.use(express.static('public'))
    app.use(cookieParser());
    app.engine('mustache', mustacheExpress());
    app.set('view engine', 'mustache');

    //APP constant

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
        userController.renderUserManagementPage(req, resp);
    })

    app.get("/user/detail", (req, resp) => {
        userController.renderUserDetailPage(req, resp);
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

    app.post("/admin/app/user/grant", (req, resp) => {
        appController.grantUserAccess(req, resp);
    })

    app.get("/admin/app", (req, resp) => {
        appController.renderAdminAppPage(req, resp);
    })

    app.get("/admin/app/detail", (req, resp) => {
        appController.renderAdminAppDetailPage(req, resp);
    })

    app.get("/admin/user/detail", (req, resp) => {
        // console.log('aaaaaaaaaaaaaa')
        userController.renderUserDetailManagementPage(req, resp);
    })

    app.post("/admin/app/listuser", (req, resp) => {
        appController.getListUserOfApp(req, resp);
    })

    app.post("/admin/app/listuser/remove", (req, resp) => {
        appController.removeUserOfApp(req, resp);
    })

    app.post("/admin/user/listuser", (req, resp) => {
        userController.getListUser(req, resp);
    })

    app.post("/admin/user/admin", (req, resp) => {
        userController.grantAdminPermission(req, resp);
    })

    app.delete("/admin/user/admin", (req, resp) => {
        userController.removeAdminPermission(req, resp);
    })

    app.get("/userguide", (req, resp) => {
        userController.renderUserGuildPage(req, resp);
    })

    app.get("/test", (req, resp) => {
        logger.info('test')
    })

    app.listen(port, () => logger.info(`Example app listening at http://localhost:${port}`))
})()
    .catch((err) => {
        logger.error("init app fail!")
        logger.error(err);
    });

process.on('unhandledRejection', (reason, promise) => {
    logger.error(reason);
})

