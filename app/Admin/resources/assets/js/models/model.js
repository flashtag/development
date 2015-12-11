class Model {

    save() {
        return client({
            method: 'PUT',
            path: '/' + this.resourcePath + '/' + this.attributes['id'],
            entity: this.attributes
        });
    }

}

export default Model;
