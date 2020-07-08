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
}

module.exports = UserDaoImpl;