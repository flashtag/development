import Model from './model';
import moment from 'moment';

class Post extends Model {
    constructor(data) {
        super('posts', {
            id: data.id,
            title: data.title,
            category_id: data.category_id,
            slug: data.slug,
            body: data.body,
            is_published: data.is_published,
            start_showing_at: data.start_showing_at,
            stop_showing_at: data.stop_showing_at,
            order: data.order,
            is_locked: data.is_locked,
            locked_by_id: data.locked_by_id,
            category: data.category ? data.category.data : {},
            tags: data.tags ? data.tags.data : [],
            fields: data.fields ? data.fields.data : [],
            revisions: data.revisions ? data.revisions.data : [],
            media: data.media ? data.media.data : {},
            created_at: data.created_at,
            updated_at: data.updated_at
        });
    }

    publish(user_id) {
        return client.patch('posts/' + this.attributes['id'] + '/publish', {
            is_published: this.attributes['is_published'],
            user_id: user_id
        });
    }

    get is_showing() {
        if (! this.attributes['is_published']) {
            return false;
        }

        var start = !!this.attributes['start_showing_at'] ? moment.unix(this.attributes['start_showing_at']) : moment("1980-01-01", "YYYY-MM-DD");
        var stop = !!this.attributes['stop_showing_at'] ? moment.unix(this.attributes['stop_showing_at']) : moment("2033-01-19", "YYYY-MM-DD");
        var now = moment();

        return (start <= now) && (now <= stop);
    }
}

export default Post;
