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
    <script src="https://cdnjs.cloudflare.com/ajax/libs/sweetalert/1.1.3/sweetalert.min.js"></script>
    <script>
        $(document).ready(function(){
            // CKEditor
            $('.rich-editor').each(function(){
                CKEDITOR.replace($(this).attr('id'));
            });

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
    </script>
@endsection