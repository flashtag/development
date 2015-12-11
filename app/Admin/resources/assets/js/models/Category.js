class Category {
    constructor(data) {
        this.id = data.id;
        this.name = data.name;
        this.slug = data.slug;
        this.description = data.description;
        this.parent_id = data.parent_id;
        this.order_by = data.order_by;
        this.order_dir = data.order_dir;
        this.posts = data.posts || [];
        this.tags = data.tags.data || [];
        this.media = data.media ? data.media.data : {};
        this.created_at = data.created_at;
        this.updated_at = data.updated_at;
    }

    static buildFromPromise(promise) {
        return promise.entity().then(function(entity) {
            return new Category(entity.data);
        });
    }
}

export default Category;
