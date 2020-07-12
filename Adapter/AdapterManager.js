
class AdapterManager {
    constructor() {
        this.apdater = [];
        this.apdater["nextcloud"] = require("./NextCloudAdapter.js");
    }

    enableUser(app, user, callback) {
        this.apdater[app].enableUser(user, callback);
    }

    disableUser(app, user, callback){
        this.apdater[app].disableUser(user, callback);
    }

}

module.exports = new AdapterManager();