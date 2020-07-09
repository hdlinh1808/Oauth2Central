const DAOImplObject = require('../DAOImpl/DAOImplObject.js')
var Mustache = require("mustache");
var BaseTemplate = require("../Template/BaseTemplate")
var fs = require("fs");

const dashboardTpl = fs.readFileSync("./views/index.mustache").toString();
class AppController {
    constructor() {
        this.appDaoImpl = DAOImplObject.getAppDaoImpl();
    }

    renderDashboardPage(req, resp) {
        let page = BaseTemplate.renderWithBaseAdminTpl("Dashboard", dashboardTpl);
        resp.send(page);
    }
}
module.exports = new AppController();