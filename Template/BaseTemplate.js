var fs = require("fs");
var Mustache = require("mustache");

class BaseTemplate {
    constructor() {
        this.baseTpl = fs.readFileSync('./views/base.mustache').toString();
        this.baseAdminTpl = fs.readFileSync('./views/baseAdmin.mustache').toString();
    }

    getBaseTpl() {
        return this.baseTpl;
    }

    renderWithBaseTpl(title, subtitle, content) {
        return Mustache.render(this.baseTpl, { content: content, title: title, subtitle: subtitle })
    }

    renderWithBaseAdminTpl(title, content, username) {
        if (username == undefined) {
            username = "";
        }
        return Mustache.render(this.baseAdminTpl, { content: content, title: title, username: username });
    }

    renderPageWithParam(page, params) {
        return Mustache.render(page, params);
    }
}

module.exports = new BaseTemplate();