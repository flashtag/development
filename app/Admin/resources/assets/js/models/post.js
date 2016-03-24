
import Model from './model';

class Post extends Model {
    constructor(data) {
        super('posts', {
            id: data.id,
            title: data.title,
            category_id: data.category_id,
            slug: data.slug,
            body: data.body,
            is_published: data.is_published,
            start_showing_at: data.start_showing_at
                ? moment.utc(data.start_showing_at).format('YYYY-MM-DD')
                : null,
            stop_showing_at: data.stop_showing_at
                ? moment.utc(data.stop_showing_at).format('YYYY-MM-DD')
                : null,
            is_locked: data.is_locked,
            locked_by_id: data.locked_by_id,
            category: data.category ? data.category : {},
            tags: data.tags ? data.tags : [],
            fields: data.fields ? data.fields : [],
            meta: data.meta ? data.meta : [],
            revisions: data.revisions ? data.revisions : [],
            media: data.media ? data.media : {},
            views: data.views,
            created_at: data.created_at,
            updated_at: data.updated_at
        });
    }

    publish(published) {
        if (typeof published === 'undefined' || published === null) {
            published = true;
        }
        console.log(published);
        return this.update({
            is_published: published
        });
    }

    lock(user) {
        console.log(user);
        return this.update({
            is_locked: true,
            locked_by_id: user.id
        });
    }

    unlock() {
        return this.update({
            is_locked: false,
            locked_by_id: null
        });
    }

    get is_showing() {
        if (! this.attributes['is_published']) {
            return false;
        }

        var start = this.attributes['start_showing_at']
            ? moment(this.attributes['start_showing_at'], 'YYYY-MM-DD')
            : moment("1980-01-01", "YYYY-MM-DD");
        var stop = this.attributes['stop_showing_at']
            ? moment(this.attributes['stop_showing_at'], 'YYYY-MM-DD')
            :moment("2033-01-19", "YYYY-MM-DD");
        var now = moment();

        return (start <= now) && (now <= stop);
    }
}

export default Post;
