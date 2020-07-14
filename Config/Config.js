const fs = require('fs');
let config = {};
try {
    console.log("Load config..");
    let rawdata = fs.readFileSync('./config.json').toString();
    config = JSON.parse(rawdata);
    console.log('Load config done!');
} catch (err) {
    config = null;
    console.log("Load config Error!")
    console.log(err);
}
module.exports = config;