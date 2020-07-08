class User {
    constructor (username, token, role, apps){
        this.username = username;
        this.token = token;
        this.role = role;
        this.apps = apps;
    }
}

module.exports = User