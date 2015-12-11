class Model {
    constructor(resourcePath, attributes) {
        this.resourcePath = resourcePath;
        this.attributes = attributes;

        // This does not work, every iteration, every property is set to the current prop being iterated.
        //for (var prop in this.attributes) {
        //    if (this.attributes.hasOwnProperty(prop)) {
        //        debugger;
        //        Object.defineProperty(this, prop, {
        //            get: function () { return this.attributes[prop]; },
        //            set: function (value) { this.attributes[prop] = value; }
        //        });
        //    }
        //}
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
