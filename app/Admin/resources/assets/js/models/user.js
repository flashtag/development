import Model from './model';

class User extends Model {
    constructor(data) {
        super('posts', {
            id: data.id,
            email: data.email,
            name: data.name,
            created_at: data.created_at,
            updated_at: data.updated_at
        });
    }
}

export default User;
