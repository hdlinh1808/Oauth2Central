const App = require('../entity/App.js')
var mongoUtil = require('../DBClient/MongoUtil');
var database = mongoUtil.getDb();
var USER_COLLECTION = mongoUtil.getUserCollection();
var APP_COLLECTION = mongoUtil.getAppCollection();
var REQUEST_APP_COLLECTION = mongoUtil.getRequestAppCollection();

var REQUEST_APP_KEY = "request_app";
class AppDaoImpl {
    constructor() {
        this.apps = ["nextcloud", "rocketchat"];
        console.log("init app data")
        this.initAppData();
    }

    async initAppData() {
        try {
            let result = {};
            console.log(this.apps);
            for (let i = 0; i < this.apps.length; i++) {
                let app = this.apps[i];
                result = await database.collection(APP_COLLECTION).updateOne({ _id: app }, { $set: { name: app } }, { upsert: true });
            }
            console.log("init app data success!");
        } catch (err) {
            console.log(err);
        }
    }

    getApp(appname) {

    }

    getListApp() {
        return this.apps;
    }

    containApp(app) {
        return this.apps.includes(app);
    }

    async updateRequestApp(app, username) {
        let updateData = {
            request_app: {
                app: app,
                uid: username
            }
        }

        try {
            let result = await database.collection(REQUEST_APP_COLLECTION).updateOne({ _id: REQUEST_APP_KEY }, { $push: updateData }, { upsert: true });
            return result;
        } catch (err) {
            console.log(err);
            return null;
        }
    }

    async addUserToApp(app, username) {
        let updateData = {
            users: username,
        }
        try {
            let result = await database.collection(APP_COLLECTION).updateOne({ _id: app }, { $push: updateData }, { upsert: true });
            return result;
        } catch (err) {
            console.log(err);
            return null;
        }
    }

    async removeUserFromApp(app, username) {
        let updateData = {
            users: username,
        }
        try {
            let result = await database.collection(APP_COLLECTION).updateOne({ _id: app }, { $pull: updateData }, { upsert: true });
            return result;
        } catch (err) {
            console.log(err);
            return null;
        }
    }

    async getListAllRequest() {
        try {
            let result = await database.collection(REQUEST_APP_COLLECTION).findOne({ "_id": REQUEST_APP_KEY });
            return result;
        } catch (err) {
            console.log(err);
            return null;
        }
    }

    async removeFromListRequest(username, app) {
        let data = {};
        data[REQUEST_APP_KEY] = {
            uid: username,
            app: app,
        }
        try {
            let result = await database.collection(REQUEST_APP_COLLECTION).updateOne({ "_id": REQUEST_APP_KEY }, { $pull: data });
            return result;
        } catch (err) {
            console.log(err);
            return null;
        }
    }

    async getListUserOfApp(app) {
        try {
            let result = await database.collection(APP_COLLECTION).findOne({ "_id": app });
            return result;
        } catch (err) {
            console.log(err);
            return null;
        }
    }
}
module.exports = AppDaoImpl;