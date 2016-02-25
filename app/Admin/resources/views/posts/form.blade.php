
@include('admin::partials.form-errors')

<div class="panel panel-default {{ $post->isShowing() ? 'border-green': 'border-red' }}">
    <div class="panel-heading">
        PUBLISHING
        <label class="showing label {{ $post->isShowing() ? 'label-success': 'label-danger' }}">
            {{ $post->isShowing() ? 'Will show on website' : 'Will not show on website' }}
        </label>
    </div>
    <div class="panel-body">
        <div class="row">
            <div class="col-md-2">
                <div class="form-group switch-wrapper">
                    <div class="publish-switch">
                        <label for="is_published">Published</label>
                        <div class="switch">
                            <input value="1" name="is_published" id="is_published" class="cmn-toggle cmn-toggle-round-md" type="checkbox"
                                    {{ $post->is_published ? 'checked' : '' }}>
                            <label for="is_published"></label>
                        </div>
                    </div>
                </div>
            </div>
            <div class="col-md-5">
                <label for="start_showing_at" data-toggle="tooltip" data-placement="top" title="If the post is published, it will not show until this date.">
                    Start showing
                </label>
                <input type="date" value="{{ $post->start_showing_at ? $post->start_showing_at->format("Y-m-d") : old('start_showing_at') }}" name="start_showing_at" id="start_showing_at" class="form-control" placeholder="Date">
            </div>
            <div class="col-md-5">
                <label for="stop_showing_at" data-toggle="tooltip" data-placement="top" title="If the post is published, it will not show after this date.">
                    Stop showing
                </label>
                <input type="date" value="{{ $post->stop_showing_at ? $post->stop_showing_at->format("Y-m-d") : old('stop_showing_at') }}" name="stop_showing_at" id="stop_showing_at" class="form-control" placeholder="Date">
            </div>
        </div>
    </div>
</div>

<div class="panel panel-default" >
    <div class="panel-heading">POST</div>
    <div class="panel-body">
        <div class="row">
            <div class="col-md-6">
                <div class="form-group">
                    <label for="title">Title</label>
                    <input type="text" value="{{ $post->title or old('title') }}" name="title" id="title" class="form-control">
                </div>
            </div>
            <div class="col-md-6">
                <div class="form-group">
                    <label for="subtitle">Subtitle</label>
                    <input type="text" value="{{ $post->subtitle or old('subtitle') }}" name="subtitle" id="subtitle" class="form-control">
                </div>
            </div>
        </div>
        <div class="row">
            <div class="col-md-6">
                <div class="form-group">
                    <label for="category">Category</label>
                    <select name="category_id" id="category" class="form-control">
                        <option value="" disabled selected>Select a category...</option>
                        @foreach ($categories as $category)
                            <option value="{{ $category->id }}"
                                    {{ $post->category && ($post->category->id == $category->id) ? 'selected' : '' }}>
                                {{ $category->name }}
                            </option>
                        @endforeach
                    </select>
                </div>
            </div>
            <div class="col-md-6">
                <div class="form-group form-tags">
                    <label for="tags">Tags</label>
                    <select name="tags[]" id="tags" multiple class="select form-control">
                        @foreach ($tags as $tag)
                            <option value="{{ $tag->id }}"
                                    {{ $post->tags && $post->tags->where('id', $tag->id)->first() ? 'selected' : '' }}>
                                {{ $tag->name }}
                            </option>
                        @endforeach
                    </select>
                </div>
            </div>
        </div>
        <div class="form-group">
            <label for="body">Body</label>
                    <textarea name="body" id="body" class="form-control rich-editor">
                        {!! $post->body or old('body') !!}
                    </textarea>
        </div>
        <div class="form-group">
            <label for="author">Author</label>
            <select id="author" name="author_id" class="select">
                <option value="" disabled selected>Select an author...</option>
                @foreach ($authors as $author)
                    <option value="{{ $author->id }}"
                            {{ $post->author && ($post->author->id == $author->id) ? 'selected' : '' }}>
                        {{ $author->name }}
                    </option>
                @endforeach
            </select>
        </div>
        <div class="form-group">
            <label for="show_author">Show author?</label>
            <div class="switch">
                <input id="show_author" name="show_author" class="cmn-toggle cmn-toggle-yes-no" type="checkbox" value="1"
                        {{ $post->show_author ? 'checked' : '' }}>
                <label for="show_author" data-on="Yes" data-off="No"></label>
            </div>
        </div>
    </div>
</div>

@if (count($fields))
    <div class="panel panel-default">
        <div class="panel-heading">CUSTOM FIELDS</div>
        <div class="panel-body">
            @foreach ($fields as $i => $field)
                <div class="form-group">
                    @include("admin::fields.templates.".$field->template)
                </div>
            @endforeach
        </div>
    </div>
@endif

<div class="panel panel-default">
    <div class="panel-heading">Image</div>
    <div class="panel-body">
        <dropzone path="/images/media/"
                  image="{{ $post->image }}"
                  to="/api/posts/{{ $post->id }}/image">
        </dropzone>
    </div>
</div>

<div class="panel panel-default">
    <div class="panel-heading">META</div>
    <div class="panel-body">
        <div class="form-group">
            <label for="meta_description">Description</label>
            <input type="text" value="{{ $post->meta_description or old('meta_description') }}" name="meta_description" id="meta_description" class="form-control">
        </div>
        <div class="form-group">
            <label for="meta_canonical">Canonical Link</label>
            <input type="text" value="{{ $post->meta_canonical or old('meta_canonical') }}" name="meta_canonical" id="meta_canonical" class="form-control">
        </div>
    </div>
</div>
