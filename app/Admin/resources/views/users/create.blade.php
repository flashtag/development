@extends('admin::layout')


@section('content')
    <ol class="breadcrumb">
        <li><a href="/admin">Home</a></li>
        <li><a href="/admin/users">Users</a></li>
        <li class="active">Create</li>
    </ol>


    <form class="Author EditForm" action="{{ route('admin.users.store') }}" method="POST">
        {{ csrf_field() }}

        <section class="info row">
            <div class="col-md-6 col-md-offset-6 clearfix">
                <div class="action-buttons">
                    <button type="submit" class="btn btn-primary"><i class="fa fa-save"></i> Save</button>
                    <a href="/admin/users" class="btn btn-default"><i class="fa fa-close"></i> Close</a>
                </div>
            </div>
        </section>

        @include('admin::users.form')

    </form>

@endsection

@section('scripts')
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
