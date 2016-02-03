
<div class="panel panel-default">
    <div class="panel-heading">Category</div>
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
    <div class="panel-heading">Media</div>
    <div class="panel-body">
        <div id="dropzone-image" class="dropzone">
            <div class="fallback">
                <input name="image" type="file" />
            </div>
        </div>
        {{--
        <media-input
                :type.sync="category.media.type"
                :url.sync="category.media.url"
                image-path="/img/uploads/media/"
                :image-upload="'/categories/'+$route.params.category_id+'/image'">
        </media-input>
        --}}
    </div>
</div>

{{--
<div class="panel panel-default">
    <div class="panel-heading">Post Ordering</div>
    <div class="panel-body">
        <div class="row">
            <div class="col-md-6">
                <div class="form-group">
                    <label for="order_by">Order posts in category by</label>
                    <select name="order_by" id="order_by" class="form-control">
                        <option value="option id">option text</option>
                    </select>
                </div>
            </div>
            <div class="col-md-6">
                <div class="form-group">
                    <label for="order_dir">Order posts in category direction</label>
                    <select v-model="category.order_dir" name="order_dir" id="order_dir" class="form-control">
                        <option value="direction id">direction text</option>
                    </select>
                </div>
            </div>
        </div>
    </div>
</div>
--}}
