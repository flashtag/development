@extends('admin::layout')

@section('content')
    <ol class="breadcrumb">
        <li><a href="/admin">Home</a></li>
        <li><a href="/admin/posts">Posts</a></li>
        <li class="active">New</li>
    </ol>

    <form class="Post EditForm" action="{{ route('admin.posts.store') }}" method="POST">
        {{ csrf_field() }}

        <section class="info row">
            <div class="col-md-6 clearfix"></div>
            <div class="col-md-6 clearfix">
                <div class="action-buttons">
                    <button class="btn btn-primary" type="submit"><i class="fa fa-save"></i> Save</button>
                    <a href="/admin/posts" class="btn btn-default"><i class="fa fa-close"></i> Cancel</a>
                </div>
            </div>
        </section>

        @include('admin::posts.form')

    </form>

@endsection

@section('scripts')
    <script src="https://cdnjs.cloudflare.com/ajax/libs/dropzone/4.2.0/min/dropzone.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/sweetalert/1.1.3/sweetalert.min.js"></script>
    <script>
        $(document).ready(function(){
            // CKEditor
            $('.rich-editor').each(function(){
                CKEDITOR.replace($(this).attr('id'));
            });

            // Dropzone
            drop.init();

            // Select2
            $('.select').select2();

            // Delete Button
            $('#delete').click(function(e){
                e.preventDefault();
                del();
            });
        });

        var notify = function (type, message) {
            if (type == 'success') {
                var icon = "fa fa-thumbs-o-up";
            } else if (type == 'warning') {
                var icon = "fa fa-warning";
            }
            $.notify({
                icon: icon,
                message: message
            }, {
                type: type,
                delay: 3000,
                offset: { x: 20, y: 70 }
            });
        };

        Dropzone.autoDiscover = false;

        var drop = {

            init: function () {
                // Overwrite dropzone's confirm method with our own
                Dropzone.confirm = this.confirm;
                // Initialize dropzone with our config and add some even listeners
                this.dropzone = new Dropzone('#dropzone-image', {
                    url: "/api/posts/{{ $post->id }}/image",
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
    </script>
@endsection