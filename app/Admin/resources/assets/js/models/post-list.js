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

    addPost(post) {
        var self = this;

        return client.get('/admin/api/posts/'+(post.id || post)).then(function (response) {
            var post = response.data;
            self.savePost(post).then(function(response) {
                var existing = self.attributes.posts.filter(function (p) {
                    return p.id == post.id;
                })[0];
                if (typeof existing === 'undefined') {
                    self.attributes.posts.push(post);
                }
            });
        });
    }

    savePost(post) {
        return client.post('/admin/api/post-lists/'+this.attributes.id+'/posts', {post: post});
    }
}

export default PostList;
