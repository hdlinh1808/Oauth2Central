const AppDaoImpl = require('./AppDaoImpl.js')
const UserDaoImpl = require('./UserDaoImpl.js')
class DAOImplObject {
    constructor(){
        this.userDaoImpl = new UserDaoImpl();
        this.appDaoImpl = new AppDaoImpl();
    }

    getUserDaoImpl(){
        return this.userDaoImpl;
    }

    getAppDaoImpl(){
        return this.appDaoImpl;
    }
}
module.exports = new DAOImplObject();