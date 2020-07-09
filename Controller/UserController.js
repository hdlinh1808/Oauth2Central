const DAOImplObject = require('../DAOImpl/DAOImplObject.js')
var BaseTemplate = require("../Template/BaseTemplate")
var fs = require("fs");

const userManagementTpl = fs.readFileSync("./views/user_manager.mustache").toString();

class UserController {
    constructor() {
        this.userDaoImpl = DAOImplObject.getUserDaoImpl();
    }

    getUser(appname) {
        return this.userDaoImpl.getUser(appname);
    }

    renderUserManagementPage(req, resp) {
        let page = BaseTemplate.renderWithBaseAdminTpl("User Management", userManagementTpl);
        resp.send(page);
    }

    getListUser(req, resp){
        let users = this.userDaoImpl.getListUser(1,2);
        resp.send(JSON.stringify(users));
    }
}
module.exports = UserController;