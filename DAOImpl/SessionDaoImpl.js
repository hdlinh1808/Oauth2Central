var logger = require("../Logger/Logger.js")(module)
var crypto = require('crypto');
var Session = require("../entity/Session.js");
var mongoUtil = require('../DBClient/MongoUtil.js');
var SESSION_COLLECTION = mongoUtil.getSessionCollection();
var database = mongoUtil.getDb();

class SessionDaoImpl {
    constructor(){
        this.userDaoImpl = null;
    }
    getUserBySession(sessionId) {
        return this.userDaoImpl.getUserBySession();
    }

    initDaoImpl(){
        this.userDaoImpl = require("./DAOImplObject.js").getUserDaoImpl();
    }

    /*
    * return sessionId;
    */
    async createUserSession(username, sub, token) {
        let sessionId = crypto.createHash('md5').update(username + sub).digest('hex');
        let session = new Session(username, token);
        session._id = sessionId;
        try {
            let result = await database.collection(SESSION_COLLECTION).insertOne(session);
            return session;
        } catch (err) {
            logger.error(err);
            return null;
        }
    }

    async addOrUpdateUserSession(username, sub, token) {
        let sessionId = crypto.createHash('md5').update(username + sub).digest('hex');
        let session = new Session(username, token);
        session._id = sessionId;
        try {
            let result = await database.collection(SESSION_COLLECTION).updateOne({ _id: sessionId }, { $set: session }, { upsert: true });

            return session;
        } catch (err) {
            logger.error(err);
            return null;
        }
    }

    async removeSession(sessionId) {
        try {
            let result = await database.collection(SESSION_COLLECTION).deleteOne({_id : sessionId});
            return result;
        } catch (err) {
            logger.error(err);
            return null;
        }
    }

    async getUserSession(sessionId) {
        try {
            let session = await database.collection(SESSION_COLLECTION).findOne({ "_id": sessionId });
            return session;
        } catch (err) {
            logger.error(err);
            return null;
        }
    }

    async getUserIdByReq(req){
        let sessionId = req.cookies.centralSession;
        let session = await this.getUserSession(sessionId);
        return session.userId;
    }
}

module.exports = SessionDaoImpl;

