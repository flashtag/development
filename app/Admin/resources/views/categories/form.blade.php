
@include('admin::partials.form-errors')

<div class="panel panel-default">
    <div class="panel-heading"><h3 class="panel-title">Category</h3></div>
    <div class="panel-body">
        <div class="form-group">
            <label for="name">Name</label>
            <input type="text" value="{{ $category->name or old('name') }}" name="name" id="name" class="form-control">
        </div>
        <div class="row">
            <div class="col-md-6">
                <div class="form-group">
                    <label for="category">Parent category</label>
                    <select name="parent_id" id="category" class="form-control">
                        <option value="" selected>None</option>
                        @foreach ($categories as $option)
                            <option value="{{ $option->id }}" {{ $category->parent_id == $option->id ? 'selected' : '' }}>
                                {{ $option->name }}
                            </option>
                        @endforeach
                    </select>
                </div>
            </div>
            <div class="col-md-6">
                <div class="form-group form-tags">
                    <label for="tags">Tags</label>
                    <select name="tags[]" id="tags" class="select form-control" multiple>
                        @foreach($tags as $tag)
                            <option value="{{ $tag->id }}"
                                    {{ $category->tags && $category->tags->where('id', $tag->id)->first() ? 'selected' : '' }}>
                                {{ $tag->name }}
                            </option>
                        @endforeach
                    </select>
                </div>
            </div>
        </div>
        <div class="form-group">
            <label for="description">Description</label>
            <textarea name="description" id="description" class="form-control rich-editor">
                {{ $category->description or old('description') }}
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
                        type="{{ $category->media ? $category->media->type : 'image' }}"
                        url="{{ $category->media ? $category->media->url : '' }}"
                        image-path="/images/media/"
                        image-upload="/api/categories/{{  $category->id }}/image">
                </media-input>
            </div>
            <div class="col-md-6">
                <div class="form-group">
                    <label for="image">Cover</label>
                    <input type="file" name="cover_image" id="cover_image" class="file form-control" accept="image/*">
                    <br>
                    <image-preview path="/images/media/" image="{{ $category->cover_image }}" height="200"></image-preview>
                </div>
            </div>
        </div>
    </div>
</div>
