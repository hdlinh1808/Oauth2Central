const SUCCESS = 1;
const FAIL = -1;
const ERROR_NOT_EXIST = -2;

function renderErrorCode(code, msg) {
    return {
        code: code,
        msg: msg,
    }
}

module.exports = {
    success: function () {
        return renderErrorCode(SUCCESS, "Success");
    },

    fail: function(msg){
        if(msg == undefined){
            msg = 'Fail';
        }
        return renderErrorCode(FAIL, msg); 
    },

    errorNotExist: function(msg){
        return renderErrorCode(ERROR_NOT_EXIST, msg);
    }
}