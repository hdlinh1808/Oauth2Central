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
        // console.log(this);
    }

    disableUser(user, callback) {
        if (user == null) {
            code = ErrorCode.fail();
            console.error("user null!");
            callback(code);
            return;
        }
        request({
            headers: renderHeader(this.adminUsername, this.adminPassword),
            uri: this.nextCloudDomain + `/ocs/v1.php/cloud/users/aws_oauth2-${user.sub}/disable`,
            method: 'PUT'
        }, function (err, res, body) {
            let code = {};
            try {
                let rs = xmlParser.toJson(body);
                logger.info(body);
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
            console.error("user null!");
            callback(code);
            return;
        }
        request({
            headers: renderHeader(this.adminUsername, this.adminPassword),
            uri: this.nextCloudDomain + `/ocs/v1.php/cloud/users/aws_oauth2-${user.sub}/enable`,
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