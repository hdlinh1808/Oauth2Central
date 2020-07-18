var logger = require("../Logger/Logger.js")(module)
class RoleManager {
    constructor() {
        this.userDaoImpl = require('../DAOImpl/DAOImplObject.js').getUserDaoImpl();
    }

    async init() {
        let users = await this.userDaoImpl.getListAdminUser();
        this.users = new Set(users);
        if(this.users.size == 0){
            logger.warning("NOT ADMIN USER FOUND! EVERYONE CAN ACCESS ADMIN PAGE!")
            logger.warning("NOT ADMIN USER FOUND! EVERYONE CAN ACCESS ADMIN PAGE!")
            logger.warning("NOT ADMIN USER FOUND! EVERYONE CAN ACCESS ADMIN PAGE!")
        }
    }

    removeUserAdmin(username) {
        this.users.delete(username);
    }

    addUserAdmin(username) {
        this.users.add(username);
    }

    isUserAdmin(username) {
        return this.users.has(username) || this.users.size == 0;
    }
}

module.exports = new RoleManager();