class TestSingleObject {
    constructor() {
        this.x = 0;
    }

    increase() {
        this.x++;
    }
}

module.exports = new TestSingleObject();