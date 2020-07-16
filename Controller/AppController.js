var logger = require("../Logger/Logger.js")(module)
const DAOImplObject = require('../DAOImpl/DAOImplObject.js')
var Mustache = require("mustache");
var BaseTemplate = require("../Template/BaseTemplate")
var fs = require("fs");
var ErrorCode = require("../ErrorCode/ErrorCode.js")
const dashboardTpl = fs.readFileSync("./views/dashboard.mustache").toString();
const adminRequestAppTpl = fs.readFileSync("./views/admin_request_app.mustache").toString();
const adminAppTpl = fs.readFileSync("./views/admin_app.mustache").toString();
const adminAppDetailTpl = fs.readFileSync("./views/admin_app_detail.mustache").toString();
const adapterManager = require("../Adapter/AdapterManager.js")
class AppController {
    constructor() {
        this.userDaoImpl = DAOImplObject.getUserDaoImpl();
        this.appDaoImpl = DAOImplObject.getAppDaoImpl();
    }

    renderDashboardPage(req, resp) {
        let page = BaseTemplate.renderWithBaseTpl("", "Dashboard", dashboardTpl);
        resp.send(page);
    }

    requestApp(req, resp) {
        let app = req.body.app;
        let sessionId = req.cookies.centralSession;
        this.userDaoImpl.addRequestApp(sessionId, app)
            .then(function (result) {
                resp.send(ErrorCode.success());
            })
            .catch(function (err) {
                logger.error(err);
                resp.send(ErrorCode.fail());
            })
    }

    renderAdminRequestAppPage(req, resp) {
        this.appDaoImpl.getListAllRequest()
            .then(function (result) {
                let data = {
                    request: result.request_app,
                }
                let content = BaseTemplate.renderPageWithParam(adminRequestAppTpl, data)
                let page = BaseTemplate.renderWithBaseAdminTpl("Request App", content);
                resp.send(page);

            }).catch(function (err) {
                logger.error("renderAdminRequestAppPage fail");
                logger.error("error: " + err)
            });
    }

    renderAdminAppPage(req, resp) {
        let apps = this.appDaoImpl.getListApp();
        let rows = [];
        for (let i = 0; i < apps.length; i++) {
            rows.push({
                id: i + 1,
                name: apps[i],
            })
        }
        let data = {
            app: rows,
        }
        let content = BaseTemplate.renderPageWithParam(adminAppTpl, data);
        let page = BaseTemplate.renderWithBaseAdminTpl("Apps", content);
        resp.send(page);
    }

    renderAdminAppDetailPage(req, resp) {
        let app = req.query.app;
        let data = {
            app: app
        }
        let content = BaseTemplate.renderPageWithParam(adminAppDetailTpl, data);
        let page = BaseTemplate.renderWithBaseAdminTpl("App detail", content);
        resp.send(page);
    }

    getListUserOfApp(req, resp) {
        let app = req.body.app;
        this.appDaoImpl.getListUserOfApp(app)
            .then((result) => {
                resp.send(result.users);
            })
            .catch((err) => {
                logger.error("get list user of app fail!")
                logger.error(err);
            });
    }

    declineAppRequest(req, resp) {
        let param = req.body;
        let uid = param.uid;//username
        let app = param.app;
        this.appDaoImpl.removeFromListRequest(uid, app)
            .then((rs1) => {
                this.userDaoImpl.removeFromListRequest(uid, app)
                    .then((rs2) => {
                        let errorCode = ErrorCode.success();
                        errorCode.uid = uid;
                        errorCode.app = app;
                        resp.send(errorCode);
                    })
                    .catch((err) => {
                        logger.error(err);
                    })
            })
            .catch(function (err) {
                logger.error(err);
            });
    }

    async acceptAppRequest(req, resp) {
        let param = req.body;
        let uid = param.uid;//username
        let app = param.app;
        let user = await this.userDaoImpl.getUserDetail(uid);
        let $this = this;
        adapterManager.enableUser(app, user, async function (data) {
            if (data.code < 0) {
                resp.send(ErrorCode.fail());
                return;
            }

            let rs = await $this.removeFromRequest(uid, app);
            if (!rs) {
                resp.send(ErrorCode.fail());
                return;
            }

            rs = await $this.appDaoImpl.addUserToApp(app, uid);
            if (!rs) {
                resp.send(ErrorCode.fail());
                return;
            }

            rs = await $this.userDaoImpl.addAppToUser(uid, app);
            if (!rs) {
                resp.send(ErrorCode.fail());
                return;
            }

            let errorCode = ErrorCode.success();
            errorCode.uid = uid;
            errorCode.app = app;
            resp.send(errorCode);
        })
    }

    async removeFromRequest(uid, app) {
        let result = await this.appDaoImpl.removeFromListRequest(uid, app);
        if (result) {
            result = await this.userDaoImpl.removeFromListRequest(uid, app);
        }
        return result;
    }

    async removeUserOfApp(req, resp) {
        let param = req.body;
        let username = param.username;
        let app = param.app;
        let user = await this.userDaoImpl.getUserDetail(username);
        let $this = this;
        adapterManager.disableUser(app, user, async function (data) {
            if (data.code < 0) {
                resp.send(ErrorCode.fail());
                return;
            }
            let rs = await $this.userDaoImpl.removeAppFromUser(username, app);
            if (!rs) {
                resp.send(ErrorCode.fail());
                return;
            }
            rs = await $this.appDaoImpl.removeUserFromApp(app, username);
            if (!rs) {
                resp.send(ErrorCode.fail());
                return;
            }
            let errorCode = ErrorCode.success();
            errorCode.username = username;
            errorCode.app = app;
            resp.send(errorCode);
        })
    }
}
module.exports = new AppController(); 