var Mustache = require("mustache");
var aws_config = require("../Config/AWSConfig.js");
const querystring = require('querystring');
var request = require('request');

var subMap = [];
class LoginController {
    constructor() {

    }
    renderLoginPage(req, resp) {
        let sub = req.cookies.sub;
        if (sub != undefined && sub != "") {
            resp.redirect("/dashboard");
            return;
        }

        resp.render('login');
    }

    loginWithAWS(req, resp, callbackUrl) {
        var url = aws_config.aws_domain + `/oauth2/authorize?response_type=code&client_id=${aws_config.central_app.client_id}&redirect_uri=${callbackUrl}`
        resp.redirect(url);
    }

    execCallbackLogin(req, resp, callbackUrl) {
        var code = req.query.code;
        if (code == undefined || code == "") {
            console.log("code not found")
            return;
        }
        var tokenParams = {
            "grant_type": "authorization_code",
            code: code,
            redirect_uri: callbackUrl,
            client_id: aws_config.central_app.client_id,
        }

        var formData = querystring.stringify(tokenParams);
        var contentLength = formData.length;

        request({
            headers: {
                'Content-Length': contentLength,
                'Content-Type': 'application/x-www-form-urlencoded',
                'Authorization': "Basic " + Buffer.from(aws_config.central_app.client_id + ":" + aws_config.central_app.client_secret).toString('base64'),
            },
            uri: aws_config.aws_domain + "/oauth2/token",
            body: formData,
            method: 'POST'
        }, function (err, res, body) {
            // console.log(this);
            let params = JSON.parse(body);
            let access_token = params.access_token;
            getUserInfo(access_token, resp, function () {

            });
        });
    }

    renderTestPage(req, resp) {
        resp.render('test', { test: 'Alligator' });
    }

    getSubMap(){
        return subMap;
    }
}

function getUserInfo(access_token, resp, callback) {
    request({
        headers: {
            'Authorization': "Bearer " + access_token,
        },
        uri: aws_config.aws_domain + "/oauth2/userInfo",
    }, function (err, res, body) {
        let params = JSON.parse(body);
        let sub = params.sub;
        subMap[sub] = sub;
        resp.cookie('sub', sub);
        resp.redirect("/dashboard");
    });
}
module.exports = LoginController;