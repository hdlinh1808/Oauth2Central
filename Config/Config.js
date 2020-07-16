const fs = require('fs');
let config = {};
var logger = require("../Logger/Logger.js")(module)
try {
    logger.info("Load config..");
    let rawdata = fs.readFileSync('./config.json').toString();
    config = JSON.parse(rawdata);
    logger.info('Load config done!');
} catch (err) {
    config = null;
    logger.error("Load config Error!")
    logger.error(err);
}
module.exports = config;