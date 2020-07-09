var aws_config = require("../Config/AWSConfig.js");

class OAuth2Controller {
    getCode(req, resp, callbackUrl) {
        var url =  aws_config.central_app + `/oauth2/authorize?response_type=code&client_id=${aws_config.central_app.client_id}&redirect_uri=${callbackUrl}`
        resp.redirect(url);
    }

    getToken() {

    }

    getInfo() {

    }
}
module.exports = new OAuth2Controller();
