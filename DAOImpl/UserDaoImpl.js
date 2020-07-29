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

    async getListUser(userRegex, skip, limit) {
        let users = [];

        let params = {};
        if (userRegex != undefined && userRegex != "") {
            params = { _id: new RegExp("^.*" + userRegex + ".*$") }
        }
        await database.collection(USER_COLLECTION).find(params).skip(skip).limit(limit).forEach(user => {
            user.token = "";
            users.push(user);
        });
        return users;
    }

    async getListUserWithTotal(userRegex, skip, limit) {
        let users = [];

        let params = {};
        if (userRegex != undefined && userRegex != "") {
            params = { _id: new RegExp("^.*" + userRegex + ".*$") }
        }
        let totalRecord = await database.collection(USER_COLLECTION).countDocuments(params);
        // console.log(totalRecords);
        await database.collection(USER_COLLECTION).find(params).skip(skip).limit(limit).forEach(user => {
            user.token = "";
            users.push(user);
        });
        return {
            users: users,
            totalRecord: totalRecord,
        };
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
            let usernames = [];
            await database.collection(ADMIN_COLLECTION).find({}).forEach((item) => {
                if (item != null) {
                    usernames.push(item._id);
                }
            });
            return usernames;
        } catch (err) {
            logger.error(err);
            return [];
        }
    }

    async setUserAdmin(username) {
        try {
            let data = {
                _id: username,
            }
            let result = await database.collection(USER_COLLECTION).updateOne({ _id: username }, { $set: { role: "admin" } })
            if (result && result.result.ok == 1 && result.result.n == 1) {
                result = await database.collection(ADMIN_COLLECTION).insertOne(data);
            } else {
                logger.error("fail,maybe user not exist, try reset page!")
                return null
            }
            return result;
        } catch (err) {
            logger.error(err);
            return null;
        }
    }

    async removeUserAdmin(username) {
        try {
            let result = await database.collection(USER_COLLECTION).updateOne({ _id: username }, { $set: { role: "viewer" } })
            if (result && result.result.ok == 1 && result.result.n == 1) {
                result = await database.collection(ADMIN_COLLECTION).deleteOne({ _id: username });
            } else {
                logger.error("fail,maybe user not exist, try reset page!")
                return null
            }
            return result;

        } catch (err) {
            logger.error(err);
            return null;
        }
    }
}

function getUserIdBySession() {

}

module.exports = UserDaoImpl;