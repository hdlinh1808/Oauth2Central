var logger = require("../Logger/Logger.js")(module)
const sessionDaoImpl = require('../DAOImpl/DAOImplObject.js').getSessionDaoImpl();
var RoleManager = require("../Middleware/RoleManager.js");
class Filter {
    filterBeforeRequest(req, resp, next) {
        let centralSession = req.cookies.centralSession;
        sessionDaoImpl.getUserSession(centralSession).then(function (session) {

            if (centralSession != undefined && centralSession != "" && session != undefined && session._id == centralSession) {
                let path = req.originalUrl;
                req.query.usernameAdmin= session.userId;
                if (path == "/" && RoleManager.isUserAdmin(session.userId)) {
                    resp.redirect("/admin/app/request");
                    return;
                }

                if (path.startsWith("/admin")) {
                    if (RoleManager.isUserAdmin(session.userId)) {
                        next();
                    } else {
                        resp.send("you don't have permission");
                    }
                    return;
                }
                next();
            } else {
                resp.clearCookie("centralSession");
                resp.redirect("/login");
            }
        }).catch((err) => {
            logger.error(err);
        })
        // next();
        // call next() here to move on to next middleware/router
    }
}

module.exports = new Filter();