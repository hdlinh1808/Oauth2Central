# Oauth2Central
### Installation
This app support only mongodb. Start with run schema validators in *initdb.js* 

run:\
`yarn install`
to install package.

`npm start`
to start app.  
### Config
All configs of this app are placed in *config.js*.  
Example:  
```json
{
    "app": {
        "nextcloud": {
            "image": "/nextcloud.png",
            "baseUrl": "http://localhost:8080",
            "admin": "admin",
            "adminPass": "admin",
            "adapter": "NextCloudAdapter",
            "prefixName": "AWS-provider",
            "description": "Nextcloud is a suite of client-server software for creating and using file hosting services.",
            "redirectUrl": "http://localhost:8080/index.php/apps/sociallogin/custom_oauth2/AWS-provider",
            "displayName": "Nextcloud"
        },
        "rocketchat": {
            "image": "/rocketchat.png",
            "baseUrl": "http://localhost:8090",
            "xAuthToken": "GUStmvcYRxDfCSRbibgHY4qm7D_ggosmHLq0RTqvZAu",
            "xUserId": "R2yvPmSgLyF2b7yXd",
            "description": "Rocket.Chat is a Web Chat Server, developed in JavaScript, using the Meteor full stack framework",
            "adapter": "RocketchatAdapter",
            "redirectUrl": "https://devlinh.auth.ap-southeast-1.amazoncognito.com/login?client_id=7n1qffmius0elg6vsoetli5t1g&redirect_uri=http%3A%2F%2Flocalhost%3A8090%2F_oauth%2Fcustomoauth2&response_type=code&state=eyJsb2dpblN0eWxlIjoicmVkaXJlY3QiLCJjcmVkZW50aWFsVG9rZW4iOiJuTmNRdnpuR093czd4VlN6eUN1UHhuUGZCaHczcHNCcHA2LWtkMHJRNVA1IiwiaXNDb3Jkb3ZhIjpmYWxzZSwicmVkaXJlY3RVcmwiOiJodHRwOi8vbG9jYWxob3N0OjgwOTAvaG9tZSJ9&scope=openid",
            "displayName": "Rocketchat"
        }
    },
    "db": {
        "addr": "mongodb://localhost:27017",
        "dbname": "test"
    },
    "aws": {
        "baseDomain": "https://devlinh.auth.ap-southeast-1.amazoncognito.com",
        "clientId": "7luaggvs8svcecsfqd312rq9ji",
        "clientSecret": "1phan8h4rd3botl88gtfvrqc6lfpruc45t3not7i336t9ci7h6tc"
    },
    "appAddr": "http://localhost:3000",
    "port": 3000
}
```

* `app` : configs for sub-apps. Each JSONObject include some field, some are required; others not.  
Required fields:
    * `image`: image url of the corresponding app. A relative path point to image in **public** folder.
    * `baseUrl`, `redirectUrl`: url of the sub app.
    * `description`: description of the app.
    * `adapter`: js file name to handle the app. Require \<adapter\>.js in **adapter** folder.  
    * `displayName` 

* `db` : config for mongodb.  
* `aws`: config for aws-cognito. 
* `appAddr`
* `port`

the fields above are required.

To add a new application, you need to add config in *config.js* follow above rules. And add Adapter.js with corresponding name in **adapter** folder.  

### Adapter
example Adapter:

```javascript
var logger = require("../Logger/Logger.js")(module)
const Adapter = require("./Adapter.js");
var ErrorCode = require("../ErrorCode/ErrorCode.js")

class ExampleAdapter extends Adapter {
    constructor(config) {
        super(config);
        //load config here
    }

    checkExistUser(user, callback) {
        //TODO
    }

    disableUser(user, callback) {
        //TODO
    }

    enableUser(user, callback) {
        //TODO
    }
}

module.exports = function (config) {
    return new ExampleAdapter(config);
}
```

* `constructor`: will load corresponding config of JSON in *config.js*  
`checkExistUser`, `disableUser`, `enableUser` are required function. If these functions isn't defined, error will show when starting app. These functions need to call 
callback once time with code parameter, example: 
    ```javascript 
    callback(ErrorCode.success())
    ```
    to make callback know that this action is success.  
    or: 
    ```javascript 
    callback(ErrorCode.fail()) // or
    callback(ErrorCode.fail(msg))
    ```
    to make callback know that this action is fail.
    
    With appropriate error code, callback will decide whether to store ninfo to mongodb or not.
* `checkExistUser`: check if a user exists with the app or not. it is called when a user press button `Request app`.
* `disableUser`, `enableUser`: disable or enable a user in child-app. Called when admin press `accept` or `remove`.


