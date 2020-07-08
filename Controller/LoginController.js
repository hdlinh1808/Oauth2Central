class LoginController {
    renderLoginPage(req, resp){
        resp.redirect("/login");
    }

    renderTestPage(req, resp){
        resp.render('test', { test: 'Alligator' });
    }
}
module.exports = LoginController;