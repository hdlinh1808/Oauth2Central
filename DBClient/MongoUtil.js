const mongo = require('mongodb');
const MongoClient = mongo.MongoClient;
const url = "mongodb://localhost:27017";
const userCollectionName = "user";
const sessionCollectionName = "session";
const appCollectionName = "app";
const requestAppCollectionName = "request_app";
var _db;
const ObjectId = require('mongoose').Types.ObjectId;

module.exports = {
    connectToServer: async function (callback) {
        try {
            console.log("init database..")
            let client = await MongoClient.connect(url, { useNewUrlParser: true, useUnifiedTopology: true });
            _db = client.db('test');
            console.log("init database done!")
            return _db;
        }catch(err){
            console.log("init db fail!");
        }
        
    },

    getDb: function () {
        // console.log(_db)
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
    }


};