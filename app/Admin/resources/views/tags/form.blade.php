
<div class="panel panel-default">
    <div class="panel-heading">Tag</div>
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
    <div class="panel-heading">Media</div>
    <div class="panel-body">
        <media-input
                type="{{ $tag->media ? $tag->media->type : 'image' }}"
                url="{{ $tag->media ? $tag->media->url : '' }}"
                image-path="/img/uploads/media/"
                image-upload="/tags/{{  $tag->id }}/image">
        </media-input>
    </div>
</div>
