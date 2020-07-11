
class AdapterManager {
    constructor() {
        this.apdater = [];
        this.apdater["nextcloud"] = require("./NextCloudAdapter.js");
    }

    enableUser(app, userId, callback) {
        this.apdater[app].enableUser(userId, callback);
    }

}

module.exports = new AdapterManager();