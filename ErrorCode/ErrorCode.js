const SUCCESS = 1;
const FAIL = -1;

function renderErrorCode(code) {
    return {
        code: code,
    }
}

module.exports = {
    success: function () {
        return renderErrorCode(SUCCESS);
    },

    fail: function(){
        return renderErrorCode(FAIL); 
    }


}