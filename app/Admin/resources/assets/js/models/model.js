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

        destroy() {
            return client({
                method: 'DELETE',
                path: '/' + this.resourcePath + '/' + this.attributes['id']
            })
        }

        _createGettersAndSetters() {
            for (var prop in this.attributes) {
                if (this.attributes.hasOwnProperty(prop)) {
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
    }

    export default Model;
