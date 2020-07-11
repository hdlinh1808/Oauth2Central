const sessionDaoImpl = require('../DAOImpl/DAOImplObject.js').getSessionDaoImpl();
class Filter {
    filterBeforeRequest(req, resp, next) {
        let centralSession = req.cookies.centralSession;
        sessionDaoImpl.getUserSession(centralSession).then(function (session) {
            if (centralSession != undefined && centralSession != "" && session != undefined && session._id == centralSession) {
                next();
            } else {
                resp.clearCookie("centralSession");
                resp.redirect("/login");
            }
        })


        // next();
        // call next() here to move on to next middleware/router
    }
}

module.exports = new Filter();