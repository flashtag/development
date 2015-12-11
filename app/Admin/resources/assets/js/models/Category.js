class Category {
    constructor(data) {
        this.id = data.id;
        this.name = data.name;
        this.slug = data.slug;
        this.description = data.description;
        this.parent_id = data.parent_id;
        this.order_by = data.order_by;
        this.order_dir = data.order_dir;
        this.parent = data.parent;
        this.posts = data.posts || [];
        this.tags = data.tags.data || [];
        this.media = data.media ? data.media.data : {};
        this.created_at = data.created_at;
        this.updated_at = data.updated_at;
    }

    get parentName() {
        if (this.parent) {
            return category.parent.data.name;
        }

        return '';
    }
}

export default Category;
