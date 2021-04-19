var logger = require("../Logger/Logger.js")(module)
const Adapter = require("./Adapter.js");
var ErrorCode = require("../ErrorCode/ErrorCode.js")

class ExampleAdapter extends Adapter {
    constructor(config) {
        super(config);
        //load config here
    }

    checkExistUser(user, callback) {
        //TODO
    }

    disableUser(user, callback) {
        //TODO
    }

    enableUser(user, callback) {
        //TODO
    }


}

module.exports = function (config) {
    return new ExampleAdapter(config);
}