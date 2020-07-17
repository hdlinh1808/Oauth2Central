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

    fail: function(){
        return renderErrorCode(FAIL, "Fail"); 
    },

    errorNotExist: function(msg){
        return renderErrorCode(ERROR_NOT_EXIST, msg);
    }
}