var logger = require("../Logger/Logger.js")(module)
let ErrorCode = require("../ErrorCode/ErrorCode.js")
const Adapter = require("./Adapter.js")
var request = require('request');
const querystring = require('querystring');
class RocketchatAdapter extends Adapter {
    constructor(config) {
        super(config);
        this.xAuthToken = config.xAuthToken;
        this.xUserId = config.xUserId;
        this.rocketChatDomain = config.baseUrl;
    }

    checkExistUser(user, callback) {
        this.getUserId(user.email).then(async (userid) => {
            try {
                // console.log(userid);
                let code = ErrorCode.success();
                if (userid == null) {
                    code = ErrorCode.errorNotExist("User isn't registered with Rocketchat");
                    callback(code);
                    return;
                }
                callback(code);
            } catch (err) {
                logger.error(err);
                callback(ErrorCode.fail());
            }
        }).catch((err) => {
            callback(ErrorCode.fail(err.message));
        })
    }

    disableUser(user, callback) {
        this.changeStatusOfUser(user, false, callback);
    }

    enableUser(user, callback) {
        this.changeStatusOfUser(user, true, callback);
    }

    changeStatusOfUser(user, status, callback) {
        this.getUserId(user.email).then(async (userid) => {
            try {
                let code = ErrorCode.success();
                if (userid == null) {
                    code = ErrorCode.errorNotExist("User isn't registered with Rocketchat");
                    callback(code);
                    return;
                }

                let params = { "activeStatus": status, "userId": userid }
                let paramStr = JSON.stringify(params);
                let dataRequest = {
                    headers: this.makeHttpRequestHeader(),
                    uri: this.rocketChatDomain + "/api/v1/users.setActiveStatus",
                    method: "POST",
                    body: paramStr,
                }


                let result = await this.makeApi(dataRequest);
                if (result.user && result.success) {
                    code = ErrorCode.success();
                } else {
                    code = ErrorCode.fail();
                }

                callback(code);
            } catch (err) {
                logger.error(err);
                callback(ErrorCode.fail());
            }
        }).catch((err) => {
            callback(ErrorCode.fail(err.message));
            logger.error(err);
        });
    }

    async getUserId(username) {
        var data = {
            headers: this.makeHttpRequestHeader(),
            uri: this.rocketChatDomain + "/api/v1/users.info?username=" + username,
            method: "GET"
        }
        // console.log("aaaa");
        let result = await this.makeApi(data);

        if (!result.success) {
            logger.error("get user id of user: " + username + " null");
            return null;
        }
        return result.user._id;
    }

    makeApi(data) {
        return new Promise((resolve, reject) => {
            request(data, (error, response, body) => {
                if (error) {
                    reject(error);
                }
                // if (response.statusCode != 200) {
                //     reject('Invalid status code <' + response.statusCode + '>');
                // }
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
            'X-Auth-Token': this.xAuthToken,
            'X-User-Id': this.xUserId,
        }
    }
}

module.exports = function (config) {
    return new RocketchatAdapter(config);
}