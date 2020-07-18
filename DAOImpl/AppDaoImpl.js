var config = require("../Config/Config.js")
var logger = require("../Logger/Logger.js")(module)
const App = require('../entity/App.js')
var mongoUtil = require('../DBClient/MongoUtil');
var database = mongoUtil.getDb();
var USER_COLLECTION = mongoUtil.getUserCollection();
var APP_COLLECTION = mongoUtil.getAppCollection();
var REQUEST_APP_COLLECTION = mongoUtil.getRequestAppCollection();

var REQUEST_APP_KEY = "request_app";
class AppDaoImpl {
    constructor() {
        let apps = Object.keys(config.app);
        this.appInfos = [];
        this.apps = [];
        let appConfigs = config.app;
        for (let i = 0; i < apps.length; i++) {
            try {
                let app = apps[i];
                let appConfig = appConfigs[app];
                let appInfo = new App(app, appConfig.image, appConfig.baseUrl, appConfig.redirectUrl, appConfig.description, appConfig.displayName);
                this.appInfos[app] = appInfo;
                // console.log(JSON.stringify(appInfo));
                this.apps.push(app);
            } catch (err) {
                logger.error(err);
            }
        }

        logger.info("init app data")
        this.initAppData();
    }

    getAppInfo(app) {
        return this.appInfos[app];
    }

    async initAppData() {
        try {
            let result = {};
            for (let i = 0; i < this.apps.length; i++) {
                let app = this.apps[i];
                result = await database.collection(APP_COLLECTION).updateOne({ _id: app }, { $set: { name: app } }, { upsert: true });
            }
            logger.info("init app data success!");
        } catch (err) {
            logger.error(err);
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
            logger.error(err);
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
            logger.error(err);
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
            logger.error(err);
            return null;
        }
    }

    async getListAllRequest() {
        try {
            let result = await database.collection(REQUEST_APP_COLLECTION).findOne({ "_id": REQUEST_APP_KEY });
            return result;
        } catch (err) {
            logger.error(err);
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
            logger.error(err);
            return null;
        }
    }

    async getListUserOfApp(app) {
        try {
            let result = await database.collection(APP_COLLECTION).findOne({ "_id": app });
            return result;
        } catch (err) {
            logger.error(err);
            return null;
        }
    }

    async getListUserOfAppLazy(app, skip, limit, userRegex) {
        try {
            let users = [];

            let params = { $exists: true };
            if (userRegex != undefined && userRegex != "") {
                params = new RegExp("^.*" + userRegex + ".*$");
            }
            let cursor = await database.collection(APP_COLLECTION).aggregate([
                { $match: { _id: app } },
                { $unwind: '$users' },
                { $match: { 'users': params } },
                { $skip: skip },
                { $limit: limit },
                { $group: { _id: '$_id', list: { $push: '$users' } } }
            ])

            while (await cursor.hasNext()) {
                const doc = await cursor.next();
                // console.log(doc);
                users = doc.list;
            }
            return users;
        } catch (err) {
            logger.error(err);
            return null;
        }
    }
}
module.exports = AppDaoImpl;