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
        (async () => {
            let apps = this.appDaoImpl.getListApp();
            let appInfos = [];
            let sessionId = req.cookies.centralSession;
            let user = await this.userDaoImpl.getUserDetailBySessionId(sessionId);
            
            for (let i = 0; i < apps.length; i++) {
                let app = apps[i];
                let appInfo = this.appDaoImpl.getAppInfo(app);
                if (appInfo == undefined) {
                    continue;
                }

                let adapter = adapterManager.getAdapter(app);
                if (adapter == null) {
                    continue;
                }

                if (typeof adapter.getInfo === "function" && user.apps.includes(app)) {
                   appInfo.info = await adapter.getInfo(user);
                }

                appInfos.push(appInfo);
            }
            let data = {
                app: appInfos,
            }
            let content = BaseTemplate.renderPageWithParam(dashboardTpl, data);
            let page = BaseTemplate.renderWithBaseTpl("", "Dashboard", content);
            resp.send(page);
        })().catch((err) => {
            logger.error(err);
        })
    }

    requestApp(req, resp) {
        (async (req, resp) => {
            let sessionId = req.cookies.centralSession;
            let app = req.body.app;
            let user = await this.userDaoImpl.getUserDetailBySessionId(sessionId);

            adapterManager.checkExistUser(app, user, async (data) => {
                try {
                    if (data.code < 0) {
                        resp.send(data);
                        return;
                    }

                    let rs = await this.userDaoImpl.addRequestApp(user.username, app);
                    if (!rs) {
                        resp.send(ErrorCode.fail());
                        return;
                    }
                    resp.send(ErrorCode.success());
                } catch (err) {
                    logger.error(err);
                }
            })

        })(req, resp).catch((err) => {
            logger.error(err);
        })
    }

    async checkUserExistAndRequestApp(resp, param, sessionId) {

    }

    renderAdminRequestAppPage(req, resp) {
        this.appDaoImpl.getListAllRequest()
            .then(function (result) {
                let data = { request: [] }
                if (result != null) {
                    data = {
                        request: result.request_app,
                    }
                }
                let content = BaseTemplate.renderPageWithParam(adminRequestAppTpl, data)
                let page = BaseTemplate.renderWithBaseAdminTpl("Request App", content, req.query.usernameAdmin);
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
        let page = BaseTemplate.renderWithBaseAdminTpl("Apps", content, req.query.usernameAdmin);
        resp.send(page);
    }

    renderAdminAppDetailPage(req, resp) {
        let app = req.query.app;
        let data = {
            app: app
        }
        let content = BaseTemplate.renderPageWithParam(adminAppDetailTpl, data);
        let page = BaseTemplate.renderWithBaseAdminTpl("App detail", content, req.query.usernameAdmin);
        resp.send(page);
    }

    getListUserOfApp(req, resp) {
        let app = req.body.app;
        let nums = req.body.nums;
        let page = req.body.page;
        let userRegex = req.body.search;
        if (nums == undefined) {
            nums = 10;
            page = 0;
        }

        let skip = 0;
        let limit = 10;
        try {
            skip = page * nums;
            limit = parseInt(nums);
        } catch (err) {
            logger.error(err);
        }

        this.appDaoImpl.getListUserOfAppLazy(app, skip, limit, userRegex)
            .then((users) => {
                let data = {
                    users: users,
                    // recordsTotal: -1,
                    // recordsFiltered: -1,
                }
                resp.send(data);
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
        if (!this.appDaoImpl.containApp(app)) {
            resp.send(ErrorCode.fail('app not found!'));
            return;
        }
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

    async grantUserAccess(req, resp) {
        let param = req.body;
        let uid = param.uid;//username
        let app = param.app;
        if (!this.appDaoImpl.containApp(app)) {
            resp.send(ErrorCode.fail('app not found!'));
            return;
        }

        adapterManager.enableUser(app, user, async function (data) {
            try {
                if (data.code < 0) {
                    resp.send(data);
                    return;
                }

                let rs = await $this.appDaoImpl.addUserToApp(app, uid);
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
            } catch (err) {
                logger.error(err);
                resp.send(ErrorCode.fail());
            }

        })

    }

    async acceptAppRequest(req, resp) {
        let param = req.body;
        let uid = param.uid;//username
        let app = param.app;
        let user = await this.userDaoImpl.getUserDetail(uid);
        let $this = this;
        if (!this.appDaoImpl.containApp(app)) {
            resp.send(ErrorCode.fail('app not found!'));
            return;
        }
        adapterManager.enableUser(app, user, async function (data) {
            if (data.code < 0) {
                resp.send(data);
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
                resp.send(data);
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