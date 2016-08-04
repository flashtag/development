import Model from './model';

class Author extends Model {
    constructor(data) {
        super('authors', {
            id: data.id,
            name: data.name,
            slug: data.slug,
            bio: data.bio,
            photo: data.photo,
            created_at: data.created_at,
            updated_at: data.updated_at
        });
    }
}

export default Author;
