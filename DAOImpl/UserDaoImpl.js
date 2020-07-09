const User = require('../entity/User.js')
var mongoUtil = require('../DBClient/MongoUtil');
var database = mongoUtil.getDb();
class UserDaoImpl {
    constructor(){
    }
    getUser(username){
        let user = new User(username,2,3,4);
        return user;
    }

    getListUser(from, to){
        from = 1, to = 7;
        return users.slice(from, to);
    }

    addUser(){
        
    }
}

var users = [new User('Linh', "123", "viewer", ["nextcloud"]),
new User('Linh1', "123", "viewer", ["nextcloud"]),
new User('Linh2', "123", "viewer", ["rocketchat"]),
new User('Linh3', "123", "viewer", ["nextcloud"]),
new User('Linh4', "123", "viewer", ["nextcloud"]),
new User('Linh5', "123", "viewer", ["nextcloud"]),
new User('Linh6', "123", "viewer", ["nextcloud"]),
new User('Linh7', "123", "viewer", ["nextcloud"]),
new User('Linh8', "123", "viewer", ["nextcloud"]),
new User('Linh9', "123", "viewer", ["nextcloud"]),
new User('Linh10', "123", "viewer", ["nextcloud"]),
new User('Linh11', "123", "viewer", ["nextcloud"]),
new User('Linh12', "123", "viewer", ["nextcloud"]),
new User('Linh13', "123", "viewer", ["nextcloud"]),
]

module.exports = UserDaoImpl;