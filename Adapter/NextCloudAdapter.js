var logger = require("../Logger/Logger.js")(module)
var request = require('request');
let xmlParser = require('xml2json');
const Adapter = require("./Adapter.js");
var ErrorCode = require("../ErrorCode/ErrorCode.js")
class NextCloudApdater extends Adapter {
    constructor(config) {
        super(config);
        this.adminUsername = config.admin;
        this.adminPassword = config.adminPass;
        this.nextCloudDomain = config.baseUrl;
        this.prefixName = config.prefixName;
        // console.log(this);
    }

    checkExistUser(user, callback) {
        if (user == null) {
            logger.error("user null!");
            callback(code);
            return;
        }
        request({
            headers: renderHeader(this.adminUsername, this.adminPassword),
            uri: this.nextCloudDomain + `/ocs/v1.php/cloud/users/${this.prefixName}-${user.username}`,
            method: 'GET'
        }, function (err, res, body) {
            let code = ErrorCode.fail();
            try {
                let rs = xmlParser.toJson(body);
                rs = JSON.parse(rs);
                if(rs.ocs.meta.status == "ok"){
                    code = ErrorCode.success();
                }else {
                    code = ErrorCode.errorNotExist("User isn't registered with Nextcloud")
                }
            } catch (err) {
                logger.error(err);
            }
            callback(code);
        })
    }

    disableUser(user, callback) {
        if (user == null) {
            code = ErrorCode.fail();
            logger.error("user null!");
            callback(code);
            return;
        }
        request({
            headers: renderHeader(this.adminUsername, this.adminPassword),
            uri: this.nextCloudDomain + `/ocs/v1.php/cloud/users/${this.prefixName}-${user.username}/disable`,
            method: 'PUT'
        }, function (err, res, body) {
            let code = {};
            try {
                let rs = xmlParser.toJson(body);
                rs = JSON.parse(rs);
                if (rs.ocs.meta.status == "ok") {
                    code = ErrorCode.success();
                } else {
                    code = ErrorCode.fail();
                }
            } catch (err) {
                code = ErrorCode.fail();
                logger.error(err);
            }
            callback(code);
        });
    }

    enableUser(user, callback) {
        if (user == null) {
            code = ErrorCode.fail();
            logger.error("user null!");
            callback(code);
            return;
        }
        request({
            headers: renderHeader(this.adminUsername, this.adminPassword),
            uri: this.nextCloudDomain + `/ocs/v1.php/cloud/users/${this.prefixName}-${user.username}/enable`,
            method: 'PUT'
        }, function (err, res, body) {
            let code = {};
            try {
                let rs = xmlParser.toJson(body);
                rs = JSON.parse(rs);
                if (rs.ocs.meta.status == "ok") {
                    code = ErrorCode.success();
                } else {
                    code = ErrorCode.errorNotExist("User isn't registered with Nextcloud")
                }
            } catch (err) {
                code = ErrorCode.fail();
                logger.error(err);
            }
            callback(code);
        });
    }
}

function renderHeader(username, password) {
    return {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': "Basic " + Buffer.from(username + ":" + password).toString('base64'),
        'OCS-APIRequest': true,
    }
}

module.exports = function (config) {
    return new NextCloudApdater(config);
}