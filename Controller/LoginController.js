var logger = require("../Logger/Logger.js")(module)
var Mustache = require("mustache");
const querystring = require('querystring');
var request = require('request');
const userDaoImpl = require('../DAOImpl/DAOImplObject.js').getUserDaoImpl();
const sessionDaoImpl = require('../DAOImpl/DAOImplObject.js').getSessionDaoImpl();
var config = require("../Config/Config.js")

//aws constant
var awsConfig = config.aws;
var AWS_DOMAIN_BASE = awsConfig.baseDomain;
var AWS_CLIENT_ID = awsConfig.clientId;
var AWS_CLIENT_SECRET = awsConfig.clientSecret;
class LoginController {
    constructor() {

    }
    renderLoginPage(req, resp) {
        let sub = req.cookies.centralSession;
        if (sub != undefined && sub != "") {
            resp.redirect("/dashboard");
            return;
        }
        //clear cookie
        resp.render('login');
    }

    loginWithAWS(req, resp, callbackUrl) {
        var url = AWS_DOMAIN_BASE + `/oauth2/authorize?response_type=code&client_id=${AWS_CLIENT_ID}&redirect_uri=${callbackUrl}`
        resp.redirect(url);
    }

    execCallbackLogin(req, resp, callbackUrl) {
        var code = req.query.code;
        if (code == undefined || code == "") {
            logger.error("code not found")
            return;
        }
        var tokenParams = {
            "grant_type": "authorization_code",
            code: code,
            redirect_uri: callbackUrl,
            client_id: AWS_CLIENT_ID,
        }

        var formData = querystring.stringify(tokenParams);
        var contentLength = formData.length;

        request({
            headers: {
                'Content-Length': contentLength,
                'Content-Type': 'application/x-www-form-urlencoded',
                'Authorization': "Basic " + Buffer.from(AWS_CLIENT_ID + ":" + AWS_CLIENT_SECRET).toString('base64'),
            },
            uri: AWS_DOMAIN_BASE + "/oauth2/token",
            body: formData,
            method: 'POST'
        }, function (err, res, body) {
            let params = JSON.parse(body);
            let access_token = params.access_token;
            getUserInfo(access_token, resp, async (params) => { //success function
                let sub = params.sub;
                let rs = await userDaoImpl.checkExistUser(params.username);
                if (!rs) {
                    await userDaoImpl.createNewUser(params.username, params.email, access_token, sub, "viewer", [], []);
                }
                let session = await sessionDaoImpl.addOrUpdateUserSession(params.username, sub, access_token);
                resp.cookie('centralSession', session._id);
                resp.redirect("/dashboard");
            });
        });
    }

    logout(req, resp) {
        let sessionId = req.cookies.centralSession;
        sessionDaoImpl.removeSession(sessionId).then(function (result) {
            if (result) {
                resp.clearCookie("centralSession");
                resp.redirect("/login");
            }
        }).catch((err) => {
            logger.error(err);
        });

    }

    renderTestPage(req, resp) {
        resp.render('test', { test: 'Alligator' });
    }

    _test() {
        logger.info('aa')
    }
}

function getUserInfo(access_token, resp, callback) {
    request({
        headers: {
            'Authorization': "Bearer " + access_token,
        },
        uri: AWS_DOMAIN_BASE + "/oauth2/userInfo",
    }, function (err, res, body) {
        if (err != null) {
            return;
        }
        let params = JSON.parse(body);
        callback(params);
    });
}
module.exports = LoginController;