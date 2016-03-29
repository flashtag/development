
@include('admin::partials.form-errors')

<div class="panel panel-default">
    <div class="panel-heading"><h3 class="panel-title">Tag</h3></div>
    <div class="panel-body">
        <div class="form-group">
            <label for="name">Name</label>
            <input type="text" value="{{ $tag->name or old('name') }}" name="name" id="name" class="form-control">
        </div>
        <div class="form-group">
            <label for="description">Description</label>
            <textarea name="description" id="description" class="form-control rich-editor">
                {{ $tag->description or old('description') }}
            </textarea>
        </div>
    </div>
</div>

<div class="panel panel-default">
    <div class="panel-heading"><h3 class="panel-title">Media</h3></div>
    <div class="panel-body">
        <div class="row">
            <div class="col-md-6">
                <media-input
                        type="{{ $tag->media ? $tag->media->type : 'image' }}"
                        url="{{ $tag->media ? $tag->media->url : '' }}"
                        image-path="/images/media/"
                        image-upload="/api/tags/{{  $tag->id }}/image">
                </media-input>
            </div>
            <div class="col-md-6">
                <div class="form-group">
                    <label for="image">Cover</label>
                    <input type="file" name="cover_image" id="cover_image" class="file form-control" accept="image/*">
                    <br>
                    <image-preview path="/images/media/" image="{{ $tag->cover_image }}" height="200"></image-preview>
                </div>
            </div>
        </div>
    </div>
</div>
