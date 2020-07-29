var logger = require("../Logger/Logger.js")(module)
const mongo = require('mongodb');
const MongoClient = mongo.MongoClient;
const userCollectionName = "user";
const sessionCollectionName = "session";
const appCollectionName = "app";
const requestAppCollectionName = "request_app";
const adminRoleCollectionName = "admin"
const ObjectId = require('mongoose').Types.ObjectId;
var config = require("../Config/Config.js")

var _db;
module.exports = {
    connectToServer: async function (callback) {
        try {
            logger.info("init database..");
            let client = await MongoClient.connect(config.db.addr, { useNewUrlParser: true, useUnifiedTopology: true });
            _db = client.db(config.db.dbname);
            logger.info("init database done!")
            return _db;
        }catch(err){
            logger.error("init db fail!");
        }
        
    },

    getDb: function () {
        return _db;
    },

    getUserCollection: function () {
        return userCollectionName;
    },

    newObjectId: function (username) {
        // return ObjectId(username);
    },

    getSessionCollection: function () {
        return sessionCollectionName;
    },

    getAppCollection: function () {
        return appCollectionName;
    },

    getRequestAppCollection: function () {
        return requestAppCollectionName;
    },

    getAdminCollection: function(){
        return adminRoleCollectionName;
    }


};