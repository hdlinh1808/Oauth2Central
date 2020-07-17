var logger = require("../Logger/Logger.js")(module)
const User = require('../entity/User.js')
var mongoUtil = require('../DBClient/MongoUtil.js');
var database = mongoUtil.getDb();
var USER_COLLECTION = mongoUtil.getUserCollection();
var ADMIN_COLLECTION = mongoUtil.getAdminCollection();

class UserDaoImpl {
    constructor() {
        this.sessionDaoImpl = null;
        this.appDaoImpl = null;
    }

    initDaoImpl() {
        this.sessionDaoImpl = require('../DAOImpl/DAOImplObject.js').getSessionDaoImpl();
        this.appDaoImpl = require('../DAOImpl/DAOImplObject.js').getAppDaoImpl();
    }
    async getUserDetail(username) {
        try {
            let user = await database.collection(USER_COLLECTION).findOne({ "_id": username });
            return user;
        } catch (err) {
            logger.error(err);
            return null;
        }
    }

    async addRequestApp(userId, app) {
        let updateData = {
            rapps: app,
        }
        try {
            let result = await database.collection(USER_COLLECTION).updateOne({ _id: userId }, { $push: updateData });
            result = await this.appDaoImpl.updateRequestApp(app, userId);
            return result;
        } catch (err) {
            logger.error("add Request App fail");
            return null;
        }
    }

    async getUserDetailBySessionId(sessionId) {
        let session = await this.sessionDaoImpl.getUserSession(sessionId);
        let userId = session.userId;
        let user = await this.getUserDetail(userId);
        return user;
    }

    async getListUser(skip, limit) {
        let users = [];
        await database.collection(USER_COLLECTION).find({}).skip(skip).limit(limit).forEach(user => {
            user.token = "";
            users.push(user);
        });
        return users;
    }

    async createNewUser(username, email, access_token, sub, role, apps, rapps, callback) {
        let user = new User(username, email, access_token, sub, role, apps, rapps);
        user._id = username;
        try {
            let result = await database.collection(USER_COLLECTION).insertOne(user);
            return true;
        } catch (err) {
            logger.error(err);
            return false;
        }
    }

    async checkExistUser(username, callback) {
        try {
            let query = await database.collection(USER_COLLECTION).findOne({ "_id": username });
            return query != null;
        } catch (err) {
            logger.error(err);
            return false;
        }
    }

    async removeFromListRequest(username, app) {
        try {
            let data = {
                rapps: app,
            }
            let result = await database.collection(USER_COLLECTION).updateOne({ "_id": username }, { $pull: data });
            return result;
        } catch (err) {
            logger.error(err);
            return false;
        }
    }

    async addAppToUser(username, app) {
        try {
            let data = {
                apps: app,
            }
            let result = await database.collection(USER_COLLECTION).updateOne({ "_id": username }, { $push: data });
            return result;
        } catch (err) {
            logger.error(err);
            return false;
        }
    }

    async removeAppFromUser(username, app) {
        try {
            let data = {
                apps: app,
            }
            let result = await database.collection(USER_COLLECTION).updateOne({ "_id": username }, { $pull: data });
            return result;
        } catch (err) {
            logger.error(err);
            return false;
        }
    }

    async getListAdminUser() {
        try {
            let result = await database.collection(ADMIN_COLLECTION).find({});
            let usernames = [];
            for (let i = 0; i < result.length; i++) {
                usernames.push(result[i]._id);
            }
            return usernames;
        } catch (err) {
            logger.error(err);
            return [];
        }
    }
}

function getUserIdBySession() {

}

module.exports = UserDaoImpl;