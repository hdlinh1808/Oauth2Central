var adminUsername = "";
var adminPassword = "";
var nextCloudDomain = "";

class NextCloudApdater {
    constructor() {
        this.adminUsername = adminUsername;
        this.adminPassword = adminPassword;
        this.nextCloudDomain = nextCloudDomain;
    }

    disableUser(username, calback) {
        request({
            headers: renderHeader(this.adminUsername, this.adminPassword),
            uri: nextCloudDomain + `/ocs/v1.php/cloud/users/${username}/disable`,
            method: 'PUT'
        }, function (err, res, body) {
            console.log(body);
            callback();
        });
    }

    enableUser(username, callback) {
        request({
            headers: renderHeader(this.adminUsername, this.adminPassword),
            uri: nextCloudDomain + `/ocs/v1.php/cloud/users/${username}/enable`,
            method: 'PUT'
        }, function (err, res, body) {
            console.log(body);
            callback();
        });
    }
}

function renderHeader(username, password) {
    return {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': "Basic " + Buffer.from(username + ":" + password).toString('base64'),
    }
}

module.exports = new NextCloudApdater();