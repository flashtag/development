import Model from './model';

class Field extends Model {
    constructor(data) {
        super('tags', {
            id: data.id,
            name: data.name,
            label: data.label,
            description: data.description,
            created_at: data.created_at,
            updated_at: data.updated_at
        })
    }
}

export default Field;
