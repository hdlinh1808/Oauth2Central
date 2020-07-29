class User {
    constructor(username, email, token, sub, role, apps, rapps) {
        this.email = email;
        this.username = username;
        this.token = token;
        this.role = role;
        this.apps = apps;
        this.rapps = rapps;
        this.sub = sub;
    }
}

module.exports = User