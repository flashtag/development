
@include('admin::partials.form-errors')

<div class="panel panel-default">
    <div class="panel-heading">Author</div>
    <div class="panel-body">
        <div class="form-group">
            <label for="name">Name</label>
            <input type="text" value="{{ $author->name or old('name') }}" name="name" id="name" class="form-control">
        </div>
        <div class="form-group">
            <label for="bio">Bio</label>
            <textarea name="bio" id="bio" class="form-control rich-editor">
                {{ $author->bio or old('bio') }}
            </textarea>
        </div>
        <div class="form-group">
            <label for="link">Link</label>
            <input type="text" value="{{ $author->link or old('link') }}" name="link" id="link" class="form-control">
        </div>
    </div>
</div>

<div class="panel panel-default">
    <div class="panel-heading">Photo</div>
    <div class="panel-body">
        <dropzone path="/images/media/"
                  image="{{ $author->photo }}"
                  to="/api/authors/{{ $author->id }}/photo">
        </dropzone>
    </div>
</div>
