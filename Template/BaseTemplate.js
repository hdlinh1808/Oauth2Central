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

    renderWithBaseTpl(title, content) {
        return Mustache.render(this.baseTpl, { content: content, title: title })
    }

    renderWithBaseAdminTpl(title, content){
        return Mustache.render(this.baseAdminTpl, { content: content, title: title })
    }

    renderPageWithParam(page, params){
        return Mustache.render(page, params);
    }
}

module.exports = new BaseTemplate();