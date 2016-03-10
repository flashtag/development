import Model from './model';

class PostList extends Model {
    constructor(data) {

        if (data.posts) {
            data.posts = data.posts.map(function (post) {
                if (post.pivot && post.pivot.order >= 0) {
                    post.order = post.pivot.order;
                    return post;
                }
            });
        }

        super('post-lists', {
            id: data.id,
            name: data.name,
            slug: data.slug,
            posts: data.posts ? data.posts : [],
            created_at: data.created_at,
            updated_at: data.updated_at
        })
    }

    savePost(post) {
        return client.post('/admin/api/post-lists/'+this.attributes.id+'/posts', {
            post_id: post.id,
            position: 1
        });
    }
}

export default PostList;
