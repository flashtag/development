import Model from './model';

class Category extends Model {
    constructor(data) {
        super('categories', {
            id: data.id,
            name: data.name,
            slug: data.slug,
            description: data.description,
            parent_id: data.parent_id > 0 ? data.parent_id : null,
            order_by: data.order_by,
            order_dir: data.order_dir,
            parent: data.parent ? data.parent.data : {},
            posts: data.posts ? data.posts.data : [],
            tags: data.tags ? data.tags.data : [],
            media: data.media ? data.media.data : {},
            created_at: data.created_at,
            updated_at: data.updated_at
        });
    }
}

export default Category;
