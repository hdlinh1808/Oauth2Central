const AppDaoImpl = require('./AppDaoImpl.js')
const UserDaoImpl = require('./UserDaoImpl.js')
const SessionDaoImpl = require("./SessionDaoImpl.js");

class DAOImplObject {
    constructor() {
        this.userDaoImpl = new UserDaoImpl();
        this.appDaoImpl = new AppDaoImpl();
        this.sessionDaoImpl = new SessionDaoImpl();

    }

    initDaoImpl() {
        this.sessionDaoImpl.initDaoImpl();
        this.userDaoImpl.initDaoImpl();
    }

    getUserDaoImpl() {
        return this.userDaoImpl;
    }

    getAppDaoImpl() {
        return this.appDaoImpl;
    }

    getSessionDaoImpl() {
        return this.sessionDaoImpl;
    }
}
module.exports = new DAOImplObject();