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
        let users = this.userDaoImpl.getListUser(1, 2);
        resp.send(JSON.stringify(users));
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

                if (availableApp.includes(app)) {
                    accessRow.push({
                        id: accessRow.length + 1,
                        name: app,
                    })
                } else if (requestedApp.includes(app)) {
                    requestedRow.push({
                        id: '',
                        name: app,
                    })
                } else {
                    notRequestRow.push({
                        id: '',
                        name: app,
                    })
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
            let page = BaseTemplate.renderWithBaseAdminTpl("User detail", content);
            // console.log(page);
            resp.send(page);
        });
        // resp.send('aa')
    }

    renderUserPageAdmin(req, resp) {

    }
}
module.exports = UserController;