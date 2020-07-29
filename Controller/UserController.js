const DAOImplObject = require('../DAOImpl/DAOImplObject.js')
class UserController {
    constructor() {
        this.userDaoImpl = DAOImplObject.getUserDaoImpl();
    }

    getUser(appname) {
        return this.userDaoImpl.getUser(appname);
    }
}
module.exports = UserController;