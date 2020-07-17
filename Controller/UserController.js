var logger = require("../Logger/Logger.js")(module)
const DAOImplObject = require('../DAOImpl/DAOImplObject.js')
var BaseTemplate = require("../Template/BaseTemplate")
var fs = require("fs");
const userManagementTpl = fs.readFileSync("./views/user_manager.mustache").toString();
const userDetailTpl = fs.readFileSync("./views/user_detail.mustache").toString();

class UserController {
    constructor() {
        this.userDaoImpl = DAOImplObject.getUserDaoImpl();
        this.appDaoImpl = DAOImplObject.getAppDaoImpl();
    }

    getUser(appname) {
        return this.userDaoImpl.getUser(appname);
    }

    renderUserManagementPage(req, resp) {
        let page = BaseTemplate.renderWithBaseAdminTpl("User Management", userManagementTpl);
        resp.send(page);
    }

    getListUser(req, resp) {
        let nums = req.body.nums;
        let page = req.body.page;
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

        this.userDaoImpl.getListUser(skip, limit).then((users) => {
            let data = {
                users: users,
                recordsTotal: 10,
                recordsFiltered: 10,
            }
            console.log(data);
            resp.send(JSON.stringify(data));

        }).catch((err) => {
            logger.error(err);
        });

    }

    renderUserDetailPage(req, resp) {
        let sessionId = req.cookies.centralSession;
        let appDaoImpl = this.appDaoImpl;
        this.userDaoImpl.getUserDetailBySessionId(sessionId).then(function (user) {
            if (!user) {
                resp.send("user not found");
                return;
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

            if (accessRow.length == 0) {
                accessRow.push({
                    id: "",
                    name: "(empty app)",
                })
            }
            if (requestedRow.length == 0 && notRequestRow.length == 0) {
                requestedRow.push({
                    id: "",
                    name: "(empty app)",
                })
            }
            data.accessRow = accessRow;
            data.requested = requestedRow;
            data.notRequest = notRequestRow;
            let content = BaseTemplate.renderPageWithParam(userDetailTpl, data);
            let page = BaseTemplate.renderWithBaseTpl("", "User detail", content);
            resp.send(page);
        }).catch((err) => {
            logger.error(err);
        });
        // resp.send('aa')
    }

    renderUserPageAdmin(req, resp) {

    }
}
module.exports = UserController;