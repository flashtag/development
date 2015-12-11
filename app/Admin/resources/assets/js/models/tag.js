class Tag {
    constructor(data) {
        this.id = data.id;
        this.name = data.name;
        this.slug = data.slug;
        this.description = data.description;
        this.posts = data.posts || [];
        this.media = data.media ? data.media.data : {};
        this.created_at = data.created_at;
        this.updated_at = data.updated_at;
    }
}

export default Tag;
