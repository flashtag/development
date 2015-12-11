class Model {
    constructor(resourcePath, attributes) {
        this.resourcePath = resourcePath;
        this.attributes = attributes;
        this._createGettersAndSetters();
    }

    _createGettersAndSetters() {
        for (var prop in this.attributes) {
            if (this.attributes.hasOwnProperty(prop)) {
                debugger;
                Object.defineProperty(this, prop, {
                    get: this._createGetterFor(prop),
                    set: this._createSetterFor(prop)
                });
            }
        }
    }

    _createGetterFor(prop) {
        return function() { return this.attributes[prop]; };
    }

    _createSetterFor(prop) {
        return function(value) { this.attributes[prop] = value; };
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
