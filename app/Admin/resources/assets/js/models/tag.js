import Model from './model';

class Tag extends Model {
    constructor(data) {
        super('tags', {
            id: data.id,
            name: data.name,
            slug: data.slug,
            description: data.description,
            posts: data.posts || [],
            media: data.media ? data.media.data : {},
            created_at: data.created_at,
            updated_at: data.updated_at
        })
    }
}

export default Tag;
