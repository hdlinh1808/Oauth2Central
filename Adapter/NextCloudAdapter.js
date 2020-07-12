var adminUsername = "admin";
var adminPassword = "admin";
var nextCloudDomain = "http://localhost:8080";
var request = require('request');
let xmlParser = require('xml2json');
let ErrorCode = require("../ErrorCode/ErrorCode.js")

class NextCloudApdater {
    constructor() {
        this.adminUsername = adminUsername;
        this.adminPassword = adminPassword;
        this.nextCloudDomain = nextCloudDomain;
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
            uri: nextCloudDomain + `/ocs/v1.php/cloud/users/AWS-provider-${user.sub}/disable`,
            method: 'PUT'
        }, function (err, res, body) {
            try {
                let rs = xmlParser.toJson(body);
                let code = {};
                rs = JSON.parse(rs);
                if (rs.ocs.meta.status == "ok") {
                    code = ErrorCode.success();
                } else {
                    code = ErrorCode.fail();
                }
            } catch (err) {
                code = ErrorCode.fail();
                console.log(err);
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
            uri: nextCloudDomain + `/ocs/v1.php/cloud/users/AWS-provider-${user.sub}/enable`,
            method: 'PUT'
        }, function (err, res, body) {
            try {
                let rs = xmlParser.toJson(body);
                let code = {};
                rs = JSON.parse(rs);
                if (rs.ocs.meta.status == "ok") {
                    code = ErrorCode.success();
                } else {
                    code = ErrorCode.fail();
                }
            } catch (err) {
                code = ErrorCode.fail();
                console.log(err);
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

module.exports = new NextCloudApdater();