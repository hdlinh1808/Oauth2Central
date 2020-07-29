var logger = require("../Logger/Logger.js")(module)
let ErrorCode = require("../ErrorCode/ErrorCode.js")
const Adapter = require("./Adapter.js")
var request = require('request');
const querystring = require('querystring');
class WordpressAdapter extends Adapter {
    constructor(config) {
        super(config);
        this.adminUsername = config.admin;
        this.adminPassword = config.adminPass;
        this.baseUrl = config.baseUrl;
        this.disableRole = config.disableRole;
        this.enableRole = config.enableRole;
    }

    checkExistUser(user, callback) {
        (async () => {
            let userId = await this.getUserId(this.createUserId(user.email));
            
            if (userId) {
                callback(ErrorCode.success());
                return;
            }
            callback(ErrorCode.errorNotExist("User isn't registered with Wordpress"));
        })().catch((err) => {
            logger.error("check exist user error!")
            logger.error(err);
            callback(ErrorCode.fail(err.message));
        })
    }

    createUserId(userId){
        let newUserId = userId.replace(/[@]+/g, '');
        newUserId = newUserId.replace(/[.]+/g, '-');
        return newUserId;
    }

    disableUser(user, callback) {
        this.changeRoleOfUser(user, this.disableRole, callback)
    }

    enableUser(user, callback) {
        console.log(this.enableRole);
        this.changeRoleOfUser(user, this.enableRole, callback)
    }

    changeRoleOfUser(user, role, callback) {
        (async () => {
            let userId = await this.getUserId(this.createUserId(user.email));
            let params = { "roles": role }
            let paramStr = JSON.stringify(params);

            var data = {
                headers: this.makeHttpRequestHeader(),
                uri: this.baseUrl + "/index.php/?rest_route=/wp/v2/users/" + userId,
                method: "POST",
                body: paramStr,
            }
            // console.log(data);
            let result = await this.makeApi(data);
            // console.log(result);
            if (result == null || result.id == null) {
                callback(ErrorCode.fail("user not found!"));
                return;
            }

            callback(ErrorCode.success());

        })().catch((err) => {
            logger.error("changeRoleOfUser error!")
            logger.error(err);
            callback(ErrorCode.fail(err.message));
        })
    }

    async getUserId(username) {
        var data = {
            headers: this.makeHttpRequestHeader(),
            uri: this.baseUrl + "/index.php/?rest_route=/wp/v2/users&slug=" + username,
            method: "GET"
        }
        console.log(data);
        let result = await this.makeApi(data);
        if (username == null || result == null || result.length == 0) {
            return null;
        }

        return result[0].id;
    }

    makeApi(data) {
        return new Promise((resolve, reject) => {
            request(data, (error, response, body) => {
                if (error) {
                    reject(error);
                }
                try {
                    resolve(JSON.parse(body));
                } catch (err) {
                    reject(err);
                }

            });
        });
    }

    makeHttpRequestHeader() {
        return {
            'Content-Type': 'application/json',
            'Authorization': "Basic " + Buffer.from(this.adminUsername + ":" + this.adminPassword).toString('base64'),
        }
    }
}
module.exports = function (config) {
    return new WordpressAdapter(config);
}