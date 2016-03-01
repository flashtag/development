import Model from './model';

class PostList extends Model {
    constructor(data) {
        super('post-lists', {
            id: data.id,
            name: data.name,
            slug: data.slug,
            posts: data.posts ? data.posts : [],
            created_at: data.created_at,
            updated_at: data.updated_at
        })
    }
}

export default PostList;
