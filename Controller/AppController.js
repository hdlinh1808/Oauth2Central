const DAOImplObject = require('../DAOImpl/DAOImplObject.js')
var Mustache = require("mustache");
var BaseTemplate = require("../Template/BaseTemplate")
var fs = require("fs");
var ErrorCode = require("../ErrorCode/ErrorCode.js")
const dashboardTpl = fs.readFileSync("./views/index.mustache").toString();
const adminRequestAppTpl = fs.readFileSync("./views/admin_request_app.mustache").toString();

const adapterManager = require("../Adapter/AdapterManager.js")
class AppController {
    constructor() {
        this.userDaoImpl = DAOImplObject.getUserDaoImpl();
        this.appDaoImpl = DAOImplObject.getAppDaoImpl();
    }

    renderDashboardPage(req, resp) {
        let page = BaseTemplate.renderWithBaseAdminTpl("Dashboard", dashboardTpl);
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
                console.log("err:" + err);
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
                console.log("renderAdminRequestAppPage fail");
                console.log("error: " + err)
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
                    .catch((err2) => {
                        console.log(err2);
                    })
            })
            .catch(function (err) {
                console.log(err);
            });
    }

    async acceptAppRequest(req, resp) {
        let param = req.body;
        let uid = param.uid;//username
        let app = param.app;
        let user = await this.userDaoImpl.getUserDetail(uid);
        let $this = this;
        adapterManager.enableUser(app, user,async function (data) {
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
        // console.log(param)
    }

    async removeFromRequest(uid, app) {
        let result = await this.appDaoImpl.removeFromListRequest(uid, app);
        if (result) {
            result = await this.userDaoImpl.removeFromListRequest(uid, app);
        }
        return result;
    }
}
module.exports = new AppController();