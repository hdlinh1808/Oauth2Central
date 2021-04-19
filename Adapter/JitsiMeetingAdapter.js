const util = require('util');
const exec = util.promisify(require('child_process').exec);
const Adapter = require("./Adapter.js")
var ErrorCode = require("../ErrorCode/ErrorCode.js")
var logger = require("../Logger/Logger.js")(module)
var mongoUtil = require('../DBClient/MongoUtil');
var database = mongoUtil.getDb();

var JISTIMEET_COLLECTION = "jitsimeeting"
class JitsiMeetingAdapter extends Adapter {

    constructor(config) {
        super(config);
        this.fileKeyPath = config.fileKeyPath;
        this.prefix = "awsoauth"
    }

    checkExistUser(user, callback) {
        (async () => {
            callback(ErrorCode.success());
            // await this.doCommandCheckUserExist(user);
        })().catch((err) => {
            logger.error(err);
            callback(ErrorCode.fail());
        })
    }

    enableUser(user, callback) {
        (async () => {
            let password = this.generatePassword(10);

            let rs = this.storePasswordToDB(user.username, password);
            if (rs == null) {
                callback(ErrorCode.fail());
                return;
            }

            let command = `chmod 400 ${this.fileKeyPath};ssh -i ${this.fileKeyPath} ubuntu@52.221.179.87 "printf '${password}\\n${password}\\n' | sudo prosodyctl adduser ${this.createUsername(user)}@video.smartxchange.digital"`
            let result = await this.doCommand(command);
            if (result.trim()) {
                callback(ErrorCode.success())
                return;
            }

            callback(ErrorCode.fail());
        })().catch((err) => {
            callback(ErrorCode.fail());
            logger.error(err);
        })
    }

    disableUser(user, callback) {
        (async () => {
            // callback(ErrorCode.success())
            // return;
            let command = `chmod 400 ${this.fileKeyPath};ssh -i ${this.fileKeyPath} ubuntu@52.221.179.87 "sudo prosodyctl deluser ${this.createUsername(user)}@video.smartxchange.digital"`
            let result = await this.doCommand(command);
            if (result.trim() == '') {
                callback(ErrorCode.success())
                return;
            }
            callback(ErrorCode.fail());
        })().catch((err) => {
            callback(ErrorCode.fail());
            logger.error(err);
        })
    }

    createUsername(user) {
        let name = this.prefix + "_" + user.username.replace(/[@]+/g, '');
        return name;
    }

    async getInfo(user) {
        let password = await this.getPassword(user);
        if (password == null || password == "") {
            return '';
        }
        return "username: " + this.createUsername(user) + ", password: " + password;
    }

    generatePassword(length) {
        var result = '';
        var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        var charactersLength = characters.length;
        for (var i = 0; i < length; i++) {
            result += characters.charAt(Math.floor(Math.random() * charactersLength));
        }
        return result;
    }

    async doCommand(command) {
        try {
            const { stdout, stderr } = await exec(command);
            return stdout;
        } catch (err) {
            console.error(err);
            return null;
        };
    }

    async doCommandCheckUserExist(user) {
        let command = `chmod 400 ${this.fileKeyPath};ssh -i ${this.fileKeyPath} ubuntu@52.221.179.87 "sudo ls /var/lib/prosody/video%2esmartxchange%2edigital/accounts/${user.username}.dat"`
        let result = await this.doCommand(command);
        // console.log(result != null);
        return result != null;
    }

    async getPassword(user) {
        try {
            let result = await database.collection(JISTIMEET_COLLECTION).findOne({ _id: user.username });
            // console.log(result)
            return result.password;
        } catch (err) {
            logger.error(err);
            return null;
        }
    }

    async storePasswordToDB(username, password) {
        let updateData = {
            password: password
        }
        try {
            let result = await database.collection(JISTIMEET_COLLECTION).updateOne({ _id: username }, { $set: updateData }, { upsert: true });
            return result;
        } catch (err) {
            logger.error(err);
            return null;
        }
    }


}

module.exports = function (config) {
    return new JitsiMeetingAdapter(config);
}