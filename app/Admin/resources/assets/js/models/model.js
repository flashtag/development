class Model {
    constructor(resourcePath, attributes) {
        this.resourcePath = resourcePath;
        this.attributes = attributes;

        // Am I going about this the right way here?
        for (var prop in this.attributes) {
            if (this.attributes.hasOwnProperty(prop)) {
                Object.defineProperty(this, prop, {
                    get: function () { return this.attributes[prop]; },
                    set: function (value) { this.attributes[prop] = value; }
                });
            }
        }
    }

    save() {
        return client({
            method: 'PUT',
            path: '/' + this.resourcePath + '/' + this.attributes['id'],
            entity: this.attributes
        });
    }

}

export default Model;
