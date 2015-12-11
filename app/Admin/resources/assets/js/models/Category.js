import Model from './model';

class Category extends Model {
    constructor(data) {
        super();
        this.resourcePath = 'categories';
        this.attributes = {
            id: data.id,
            name: data.name,
            slug: data.slug,
            description: data.description,
            parent_id: data.parent_id > 0 ? data.parent_id : null,
            order_by: data.order_by,
            order_dir: data.order_dir,
            parent: data.parent,
            posts: data.posts ? data.posts.data : [],
            tags: data.tags.data || [],
            media: data.media ? data.media.data : {},
            created_at: data.created_at,
            updated_at: data.updated_at
        };
    }

    get id() {
        return this.attributes['id'];
    }

    set id(value) {
        this.attributes['id'] = value;
    }

    get name() {
        return this.attributes['name'];
    }

    set name(value) {
        this.attributes['name'] = value;
    }

    get slug() {
        return this.attributes['slug'];
    }

    set slug(value) {
        this.attributes['slug'] = value;
    }

    get description() {
        return this.attributes['description'];
    }

    set description(value) {
        this.attributes['description'] = value;
    }

    get parent_id() {
        return this.attributes['parent_id'];
    }

    set parent_id(value) {
        this.attributes['parent_id'] = value;
    }

    get order_by() {
        return this.attributes['order_by'];
    }

    set order_by(value) {
        this.attributes['order_by'] = value;
    }

    get order_dir() {
        return this.attributes['order_dir'];
    }

    set order_dir(value) {
        this.attributes['order_dir'] = value;
    }

    get parent() {
        return this.attributes['parent'];
    }

    set parent(value) {
        this.attributes['parent'] = value;
    }

    get posts() {
        return this.attributes['posts'];
    }

    set posts(value) {
        this.attributes['posts'] = value;
    }

    get tags() {
        return this.attributes['tags'];
    }

    set tags(value) {
        this.attributes['tags'] = value;
    }

    get media() {
        return this.attributes['media'];
    }

    set media(value) {
        this.attributes['media'] = value;
    }

    get created_at() {
        return this.attributes['created_at'];
    }

    set created_at(value) {
        this.attributes['created_at'] = value;
    }

    get updated_at() {
        return this.attributes['updated_at'];
    }

    set updated_at(value) {
        this.attributes['updated_at'] = value;
    }

    get parentName() {
        return this.parent ? this.parent.data.name : '';
    }
}

export default Category;
