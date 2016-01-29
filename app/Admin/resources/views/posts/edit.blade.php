@extends('admin::layout')

@section('content')
    <ol class="breadcrumb">
        <li><a href="/admin">Home</a></li>
        <li><a href="/admin/posts">Posts</a></li>
        <li class="active">{{ $post->title }}</li>
    </ol>

    <form class="Post EditForm">

        <section class="info row">
            <div class="col-md-6 clearfix">
                <a href="/admin/posts/{{ $post->id }}/revisions" class="btn btn-link">
                    <i class="fa fa-history"></i> Revision history
                </a>
            </div>
            <div class="col-md-6 clearfix">
                <div class="action-buttons">
                    <button @click.prevent="save" class="btn btn-primary"><i class="fa fa-save"></i> Save</button>
                    <button @click.prevent="delete" class="btn btn-danger"><i class="fa fa-trash"></i> Delete</button>
                    <a href="/admin/posts" class="btn btn-default"><i class="fa fa-close"></i> Close</a>
                </div>
            </div>
        </section>

        <div class="panel panel-default {{ $post->is_showing ? 'border-green': 'border-red' }}">
            <div class="panel-heading">
                PUBLISHING
                <label class="showing label {{ $post->is_showing ? 'label-success': 'label-danger' }}">
                    {{ $post->is_showing ? 'Will show on website' : 'Will not show on website' }}
                </label>
            </div>
            <div class="panel-body">
                <div class="row">
                    <div class="col-md-2">
                        <div class="form-group switch-wrapper">
                            <div class="publish-switch">
                                <label for="is_published">Published</label>
                                <div class="switch">
                                    <input value="{{ $post->is_published }}" name="is_published" id="is_published" class="cmn-toggle cmn-toggle-round-md" type="checkbox">
                                    <label for="is_published"></label>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-5">
                        <label for="start_showing_at" data-toggle="tooltip" data-placement="top" title="If the post is published, it will not show until this date.">
                            Start showing
                        </label>
                        <input type="date" value="{{ $post->start_showing_at->format("Y-m-d") }}" name="start_showing_at" id="start_showing_at" class="form-control" placeholder="Date">
                    </div>
                    <div class="col-md-5">
                        <label for="stop_showing_at" data-toggle="tooltip" data-placement="top" title="If the post is published, it will not show after this date.">
                            Stop showing
                        </label>
                        <input type="date" value="{{ $post->stop_showing_at->format("Y-m-d") }}" name="stop_showing_at" id="stop_showing_at" class="form-control" placeholder="Date">
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
                            <input type="text" value="{{ $post->title }}" name="title" id="title" class="form-control">
                        </div>
                    </div>
                    <div class="col-md-6">
                        <div class="form-group">
                            <label for="subtitle">Subtitle</label>
                            <input type="text" value="{{ $post->subtitle }}" name="subtitle" id="subtitle" class="form-control">
                        </div>
                    </div>
                </div>
                <div class="row">
                    <div class="col-md-6">
                        <div class="form-group">
                            <label for="category">Category</label>
                            <select name="category" id="category" class="form-control">
                                <option value="" disabled selected>Select a category...</option>
                                @foreach ($categories as $category)
                                    <option value="{{ $category->id }}"
                                            {{ $post->category->id == $category->id ? 'selected' : '' }}>
                                        {{ $category->name }}
                                    </option>
                                @endforeach
                            </select>
                        </div>
                    </div>
                    <div class="col-md-6">
                        <div class="form-group form-tags">
                            <label for="tags">Tags</label>
                            <select name="tags" id="tags" multiple class="form-control">
                                @foreach ($tags as $tag)
                                    <option value="{{ $tag->id }}"
                                            {{ $post->tags->where('id', $tag->id)->first() ? 'selected' : '' }}>
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
                        {!! $post->body !!}
                    </textarea>
                </div>
                <div class="form-group">
                    <label for="author">Author</label>
                    <select id="author" name="author">
                        <option value="" disabled selected>Select an author...</option>
                        @foreach ($authors as $author)
                            <option value="{{ $author->id }}"
                                    {{ $post->author->id == $author->id ? 'selected' : '' }}>
                                {{ $author->name }}
                            </option>
                        @endforeach
                    </select>
                </div>
                <div class="form-group">
                    <label for="show_author">Show author?</label>
                    <div class="switch">
                        <input id="show_author" class="cmn-toggle cmn-toggle-yes-no" type="checkbox" value="{{ $post->show_author }}">
                        <label for="show_author" data-on="Yes" data-off="No"></label>
                    </div>
                </div>
            </div>
        </div>

        @if (count($fields))
        <div class="panel panel-default">
            <div class="panel-heading">CUSTOM FIELDS</div>
            <div class="panel-body">
                @foreach ($fields as $field)
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
                <div class="form-group">
                    <label>Image</label>
                    <div id="dropzone-image" class="dropzone">
                        <div class="fallback">
                            <input name="image" type="file" />
                        </div>
                    </div>
                </div>
                {{--
                <dropzone
                        path="/img/uploads/posts/"
                        :image="post.image"
                        :to="'/posts/'+postId+'/image'">
                </dropzone>
                --}}
            </div>
        </div>

        <div class="panel panel-default">
            <div class="panel-heading">META</div>
            <div class="panel-body">
                <div class="form-group">
                    <label for="description">Description</label>
                    <input type="text" value="{{ $post->meta->description }}" name="description" id="description" class="form-control">
                </div>
                <div class="form-group">
                    <label for="url">Canonical Link</label>
                    <input type="text" value="{{ $post->meta->url }}" name="url" id="url" class="form-control">
                </div>
            </div>
        </div>

    </form>
@endsection

@section('scripts')
    <script src="https://cdnjs.cloudflare.com/ajax/libs/dropzone/4.2.0/min/dropzone.min.js"></script>
    {{--<script src="https://cdnjs.cloudflare.com/ajax/libs/sweetalert/1.1.3/sweetalert.min.js"></script>--}}
    <script>
        Dropzone.autoDiscover = false;

        var drop = {

            init: function () {
                // Overwrite dropzone's confirm method with our own
                Dropzone.confirm = this.confirm;
                // Initialize dropzone with our config and add some even listeners
                this.dropzone = new Dropzone('#dropzone-image', {
                    url: "/api" + this.to,
                    dictDefaultMessage: "Drop image file here to upload",
                    dictRemoveFileConfirmation: "Are you sure you want to delete this?",
                    paramName: "image",
                    maxFiles: 1,
                    maxFilesize: 1.5,
                    uploadMultiple: false,
                    headers: { "Authorization": localStorage.getItem('jwt-token') }
                }).on('maxfilesreached', function() {
                    //$('#dropzone-image').removeClass('dz-clickable'); // remove cursor
                    //$('#dropzone-image')[0].removeEventListener('click', this.listeners[1].events.click);
                }).on('maxfilesexceeded', function (file) {
                    //this.removeFile(file);
                }).on('removedfile', function (file) {
                    this.delete(file);
                }.bind(this));
                // Show existing photo in dropzone box
                if (this.image && this.image.length > 0) {
                    this.showExistingImage();
                }
            },

            delete: function (file) {
                client({
                    method: 'DELETE',
                    path: this.to
                }).then(function () {
                    swal({
                        html: true,
                        title: 'Deleted!',
                        text: '<strong>' + file.name + '</strong> was deleted!',
                        type: 'success'
                    });
                }, function () {
                    swal("Oops", "We couldn't connect to the server!", "error");
                });
            },

            showExistingImage: function () {
                var mockFile = {name: this.image, size: 432100};
                this.dropzone.emit("addedfile", mockFile);
                this.dropzone.emit("thumbnail", mockFile, this.path + this.image);
                this.dropzone.emit("complete", mockFile);
                this.dropzone.files.push(mockFile);
                this.dropzone.options.maxFiles = this.dropzone.options.maxFiles - 1;
            },

            confirm: function(question, accepted, rejected) {
                swal({
                    title: 'Hold up!',
                    text: question,
                    type: 'warning',
                    showCancelButton: true,
                    confirmButtonColor: '#DD6B55',
                    confirmButtonText: 'Yes!',
                    closeOnConfirm: false,
                    showLoaderOnConfirm: true
                }, accepted, rejected);
            }
        };

        $(document).ready(function(){
            drop.init();
        });
    </script>
@endsection