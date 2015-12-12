class Model {
    constructor(resourcePath, attributes) {
        this.resourcePath = resourcePath;
        this.attributes = attributes;
        this._createGettersAndSetters();
    }

    static create(attributes) {
        var model = new this(attributes);

        return client({
            method: 'POST',
            path: '/' + model.resourcePath,
            entity: model.attributes
        });
    }

    save() {
        return client({
            method: 'PUT',
            path: '/' + this.resourcePath + '/' + this.attributes['id'],
            entity: this.attributes
        });
    }

    update(attributes) {
        return client({
            method: 'PATCH',
            path: '/' + this.resourcePath + '/' + this.attributes['id'],
            entity: attributes
        });
    }

    destroy() {
        return client({
            method: 'DELETE',
            path: '/' + this.resourcePath + '/' + this.attributes['id']
        })
    }

    _createGettersAndSetters() {
        for (let prop in this.attributes) {
            if (this.attributes.hasOwnProperty(prop)) {
                Object.defineProperty(this, prop, {
                    get: function() { return this.attributes[prop]; },
                    set: function(value) { this.attributes[prop] = value; }
                });
            }
        }
    }
}

export default Model;
