
@include('admin::partials.form-errors')

<div class="panel panel-default {{ $page->isShowing() ? 'border-green': 'border-red' }}">
    <div class="panel-heading">
        <h3 class="panel-title">Publishing
            <label class="showing label {{ $page->isShowing() ? 'label-success': 'label-danger' }}">
                {{ $page->isShowing() ? 'Will show on website' : 'Will not show on website' }}
            </label>
        </h3>
    </div>
    <div class="panel-body">
        <div class="row">
            <div class="col-md-2">
                <div class="form-group switch-wrapper">
                    <div class="publish-switch">
                        <label for="is_published">Published</label>
                        <div class="switch">
                            <input value="1" name="is_published" id="is_published" class="cmn-toggle cmn-toggle-round-md" type="checkbox"
                                    {{ $page->is_published ? 'checked' : '' }}>
                            <label for="is_published"></label>
                        </div>
                    </div>
                </div>
            </div>
            <div class="col-md-5">
                <label for="start_showing_at" data-toggle="tooltip" data-placement="top" title="If the page is published, it will not show until this date.">
                    Start showing
                </label>
                <input type="date" value="{{ $page->start_showing_at ? $page->start_showing_at->format("Y-m-d") : old('start_showing_at') }}" name="start_showing_at" id="start_showing_at" class="form-control" placeholder="Date">
            </div>
            <div class="col-md-5">
                <label for="stop_showing_at" data-toggle="tooltip" data-placement="top" title="If the page is published, it will not show after this date.">
                    Stop showing
                </label>
                <input type="date" value="{{ $page->stop_showing_at ? $page->stop_showing_at->format("Y-m-d") : old('stop_showing_at') }}" name="stop_showing_at" id="stop_showing_at" class="form-control" placeholder="Date">
            </div>
        </div>
    </div>
</div>

<div class="panel panel-default" >
    <div class="panel-heading"><h3 class="panel-title">Page</h3></div>
    <div class="panel-body">
        <div class="row">
            <div class="col-md-6">
                <div class="form-group">
                    <label for="title">Title</label>
                    <input type="text" value="{{ $page->title or old('title') }}" name="title" id="title" class="form-control">
                </div>
            </div>
            <div class="col-md-6">
                <div class="form-group">
                    <label for="subtitle">Subtitle</label>
                    <input type="text" value="{{ $page->subtitle or old('subtitle') }}" name="subtitle" id="subtitle" class="form-control">
                </div>
            </div>
        </div>
        <div class="form-group">
            <label for="slug">Slug</label>
            <input name="slug" id="slug" class="form-control" value="{{ $page->slug or old('slug') }}">
        </div>
        <div class="form-group">
            <label for="template">Template</label>
            <select name="template" id="template" class="form-control">
                @foreach ($templates as $value => $name)
                    <option value="{{ $value }}" {{ (
                        (empty($page->template) && $value == 'flashtag::page-templates.default') || $value == $page->template)
                            ? 'selected'
                            : ''
                        }}>{{ $value }}</option>
                @endforeach
            </select>
        </div>
        <div class="form-group">
            <label for="body">Body</label>
            <textarea name="body" id="body" class="form-control rich-editor">
                {!! $page->body or old('body') !!}
            </textarea>
        </div>
    </div>
</div>

<div class="panel panel-default">
    <div class="panel-heading"><h3 class="panel-title">Images</h3></div>
    <div class="panel-body">
        <div class="col-md-6">
            <div class="form-group">
                <label for="image">Image</label>
                <input type="file" name="image" id="image" class="file form-control" accept="image/*">
                <br>
                <image-preview path="/images/media/" image="{{ $page->image }}" height="200"></image-preview>
            </div>
        </div>
        <div class="col-md-6">
            <div class="form-group">
                <label for="image">Cover</label>
                <input type="file" name="cover_image" id="cover_image" class="file form-control" accept="image/*">
                <br>
                <image-preview path="/images/media/" image="{{ $page->cover_image }}" height="200"></image-preview>
            </div>
        </div>
    </div>
</div>

<div class="panel panel-default">
    <div class="panel-heading"><h3 class="panel-title">Meta</h3></div>
    <div class="panel-body">
        <div class="form-group">
            <label for="meta_description">Description</label>
            <input type="text" value="{{ $page->meta_description or old('meta_description') }}" name="meta_description" id="meta_description" class="form-control">
        </div>
        <div class="form-group">
            <label for="meta_canonical">Canonical Link</label>
            <input type="text" value="{{ $page->meta_canonical or old('meta_canonical') }}" name="meta_canonical" id="meta_canonical" class="form-control">
        </div>
    </div>
</div>
