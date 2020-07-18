var logger = require("../Logger/Logger.js")(module)
const DAOImplObject = require('../DAOImpl/DAOImplObject.js')
var BaseTemplate = require("../Template/BaseTemplate")
var fs = require("fs");
const userManagementTpl = fs.readFileSync("./views/user_manager.mustache").toString();
const userDetailTpl = fs.readFileSync("./views/user_detail.mustache").toString();
const adminUserDetailTpl = fs.readFileSync("./views/admin_user_detail.mustache").toString();
var ErrorCode = require("../ErrorCode/ErrorCode.js")
var RoleManager = require("../Middleware/RoleManager.js");
class UserController {
    constructor() {
        this.userDaoImpl = DAOImplObject.getUserDaoImpl();
        this.appDaoImpl = DAOImplObject.getAppDaoImpl();
    }

    getUser(appname) {
        return this.userDaoImpl.getUser(appname);
    }

    renderUserManagementPage(req, resp) {
        let page = BaseTemplate.renderWithBaseAdminTpl("User Management", userManagementTpl, req.query.username);
        resp.send(page);
    }

    getListUser(req, resp) {
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
            console.log(err);
        }

        this.userDaoImpl.getListUserWithTotal(userRegex, skip, limit).then((data) => {
            let users = data.users;
            let totalRecord = data.totalRecord;
            
            let respData = {
                users: users,
                recordsTotal: totalRecord,
                recordsFiltered: totalRecord,
            }
            resp.send(JSON.stringify(respData));

        }).catch((err) => {
            logger.error(err);
        });

    }

    renderUserDetailPage(req, resp) {
        let sessionId = req.cookies.centralSession;
        let appDaoImpl = this.appDaoImpl;
        let $this = this;
        this.userDaoImpl.getUserDetailBySessionId(sessionId).then(function (user) {
            let data = $this.getDataUserInfo(user, appDaoImpl);
            if (!data) {
                resp.send("user not found");
                return;
            }
            let content = BaseTemplate.renderPageWithParam(userDetailTpl, data);
            let page = BaseTemplate.renderWithBaseTpl("", "User detail", content);
            resp.send(page);
        }).catch((err) => {
            logger.error(err);
        });
    }

    renderUserDetailManagementPage(req, resp) {
        let username = req.query.username;
        let appDaoImpl = this.appDaoImpl;
        this.userDaoImpl.getUserDetail(username).then((user) => {
            let data = this.getDataUserInfo(user, appDaoImpl);
            if (!data) {
                resp.send("user not found");
                return;
            }
            let content = BaseTemplate.renderPageWithParam(adminUserDetailTpl, data);
            let page = BaseTemplate.renderWithBaseAdminTpl("User detail", content, req.query.username);
            resp.send(page);
        }).catch((err) => {
            logger.error(err);
        })
    }

    getDataUserInfo(user, appDaoImpl) {
        if (!user) {
            return null;
        }
        let data = {
            username: user.username,
            email: user.email,
            role: user.role,
        }

        let accessRow = [];
        let notRequestRow = [];
        let requestedRow = [];
        let currentApp = appDaoImpl.getListApp();
        let availableApp = user.apps;
        let requestedApp = user.rapps;

        let notAvaiIndex = 0;
        for (let i = 0; i < currentApp.length; i++) {

            let app = currentApp[i];
            let appInfo = appDaoImpl.getAppInfo(app);
            let element = {
                id: '',
                name: app,
                image: appInfo.imageUrl,
                appUrl: appInfo.redirectUrl,
            }
            if (availableApp.includes(app)) {
                element.id = accessRow.length + 1;
                accessRow.push(element);
            } else if (requestedApp.includes(app)) {
                requestedRow.push(element)
            } else {
                notRequestRow.push(element)
            }
        }

        // if (accessRow.length == 0) {
        //     accessRow.push({
        //         id: "",
        //         name: "(empty app)",
        //     })
        // }
        // if (requestedRow.length == 0 && notRequestRow.length == 0) {
        //     requestedRow.push({
        //         id: "",
        //         name: "(empty app)",
        //     })
        // }
        data.accessRow = accessRow;
        data.requested = requestedRow;
        data.notRequest = notRequestRow;
        return data;
    }

    grantAdminPermission(req, resp) {
        (async () => {
            let username = req.body.username;
            let result = await this.userDaoImpl.setUserAdmin(username);
            if (result) {
                RoleManager.addUserAdmin(username);
                resp.send(ErrorCode.success())
            } else {
                resp.send(ErrorCode.fail('Fail, maybe user not exist!'))
            }
        })().catch((err) => {
            logger.error(err);
            resp.send(ErrorCode.fail())
        })
    }

    removeAdminPermission(req, resp) {
        (async () => {
            let username = req.body.username;
            let result = await this.userDaoImpl.removeUserAdmin(username);
            if (result) {
                RoleManager.removeUserAdmin(username);
                resp.send(ErrorCode.success())
            } else {
                resp.send(ErrorCode.fail('Fail, maybe user not exist!'))
            }
        })().catch((err) => {
            logger.error(err);
            resp.send(ErrorCode.fail())
        })
    }

    renderUserPageAdmin(req, resp) {

    }
}
module.exports = UserController;