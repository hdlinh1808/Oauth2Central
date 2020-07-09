var AWS = require('aws-sdk');
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
    if (err) console.log(err, err.stack); // an error occurred
    else console.log(data);           // successful response
});