var AWS = require('aws-sdk');
var logger = require("./Logger/Logger.js")(module)
AWS.config.region = 'ap-southeast-1'; // Region
AWS.config.credentials = new AWS.CognitoIdentityCredentials({
    IdentityPoolId: 'ap-southeast-1:51f671f7-327c-4547-b142-ef14de9f178d',
});

var cognitoidentityserviceprovider = new AWS.CognitoIdentityServiceProvider();
var params = {
    UserPoolId: 'ap-southeast-1_oLZi9Q11c', /* required */
    AttributesToGet: null,
    Filter: '',
    Limit: 1,
};

cognitoidentityserviceprovider.listUsers(params, function (err, data) {
    if (err) logger.error(err); // an error occurred
    else logger.error(data);           // successful response
});