var config = require("../Config/Config.js")
var logger = require("../Logger/Logger.js")(module)
const Adapter = require("./Adapter.js");
var ErrorCode = require("../ErrorCode/ErrorCode.js")
class AdapterManager {
    constructor() {
        this.adapter = [];
        let apps = Object.keys(config.app);
        logger.info("init 3rd apps adapter...")
        for (let i = 0; i < apps.length; i++) {
            try {
                let app = apps[i];
                logger.info("init apdapter for: " + app + "...");
                let appConfig = config.app[app];
                let adapterName = appConfig.adapter;
                let adapter = require("./" + adapterName + ".js")(appConfig);

                if (!adapter instanceof Adapter) {
                    logger.error(adapter.constructor.name + " is not Adapter type!");
                }
                this.adapter[app] = adapter;
                logger.info("init apdapter for: " + app + " done!");
            } catch (err) {
                logger.error(err);
            }
        }
        logger.info("init 3rd apps adapter done!")
    }

    enableUser(app, user, callback) {
        let adapter = this.adapter[app];
        if (adapter == undefined) {
            logger.error('adapter of ' + app + " undefined")
            callback(ErrorCode.fail())
            return;
        }
        adapter.enableUser(user, callback);
    }

    disableUser(app, user, callback) {
        let adapter = this.adapter[app];
        if (adapter == undefined) {
            logger.error('adapter of ' + app + " undefined")
            callback(ErrorCode.fail())
            return;
        }
        adapter.disableUser(user, callback);
    }

    checkExistUser(app, user, callback) {
        let adapter = this.adapter[app];
        if (adapter == undefined) {
            logger.error('adapter of ' + app + " undefined")
            callback(ErrorCode.fail())
            return;
        }
        adapter.checkExistUser(user, callback);
    }

    getAdapter() {

    }
}

module.exports = new AdapterManager();