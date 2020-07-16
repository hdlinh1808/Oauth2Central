var logger = require("./Logger/Logger.js")(module)
const mongo = require('mongodb');
const MongoClient = mongo.MongoClient;
let url = "admin:admin@mongodb://localhost:27017/hastic"

MongoClient.connect(url, { useNewUrlParser: true, useUnifiedTopology: true }, function (err, body) {
    logger.error(err);
    var myobj = { name: "Company Inc", address: "Highway 37" };
    var dbo =body.db();
    dbo.collection("customers").insertOne(myobj, function (err, res) {
        if (err) throw err;
        logger.info("1 document inserted");
        dbo.close();
    });
});