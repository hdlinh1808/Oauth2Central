const App = require('../entity/App.js')
var mongoUtil = require('../DBClient/MongoUtil');
var database = mongoUtil.getDb();
class AppDaoImpl {
    constructor() {
        
    }

    getApp(appname) {

    }
}
module.exports = AppDaoImpl;