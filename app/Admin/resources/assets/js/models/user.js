import Model from './model';

class User extends Model {
    constructor(data) {
        super('users', {
            id: data.id,
            email: data.email,
            name: data.name,
            admin: data.admin,
            created_at: data.created_at,
            updated_at: data.updated_at
        });
    }
}

export default User;
