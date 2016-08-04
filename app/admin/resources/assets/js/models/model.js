
class Model {
    constructor(resourcePath, attributes) {
        this.resource = resource('/admin/api/'+resourcePath + '{/id}');
        this.attributes = attributes;
        this._createGettersAndSetters();
    }

    static create(attributes) {
        var model = new this(attributes);

        return model.resource.save(
            { id: model.id },
            model.attributes
        );
    }

    save() {
        return this.resource.update(
            { id: this.attributes['id'] },
            this.attributes
        );
    }

    update(attributes) {
        return this.resource.update(
            { id: this.attributes['id'] },
            attributes
        );
    }

    destroy() {
        return this.resource.delete(
            { id: this.attributes['id'] }
        );
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
