const DAOImplObject = require('../DAOImpl/DAOImplObject.js')
class AppController {
    constructor() {
        this.appDaoImpl = DAOImplObject.getAppDaoImpl();
    }
}
module.exports = AppController;