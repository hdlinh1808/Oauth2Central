class Adapter { 
    constructor(config) {
        if(config == undefined){
            throw new Error(this.constructor.name + "must have config object passed to constructor!")
        }
        if (!this.enableUser) {
            throw new Error(this.constructor.name + " must have enableUser function!");
        }

        if (!this.disableUser) {
            throw new Error(this.constructor.name + " must have disableUser function!");
        }
    }
}
module.exports = Adapter;