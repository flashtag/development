@extends('admin::layout')

@section('content')
    <ol class="breadcrumb">
        <li><a href="/admin">Home</a></li>
        <li><a href="/admin/post-lists">Post Lists</a></li>
        <li class="active">{{ $postList->name }}</li>
    </ol>

    <form class="Category EditForm" action="{{ route('admin.post-lists.update', [$postList->id]) }}" method="POST">
        {{ csrf_field() }}
        {{ method_field('PUT') }}

        <section class="info row">
            <div class="col-md-6 col-md-offset-6 clearfix">
                <div class="action-buttons">
                    <button type="submit" class="btn btn-primary"><i class="fa fa-save"></i> Save</button>
                    <a href="#delete" id="delete" class="btn btn-danger"><i class="fa fa-trash"></i> Delete</a>
                    <a href="/admin/post-lists" class="btn btn-default"><i class="fa fa-close"></i> Close</a>
                </div>
            </div>
        </section>

        @include('admin::post-lists.form')

        <div class="panel panel-default">
            <div class="panel-heading">Posts</div>
            <div class="panel-body">
                <post-list :post-list-id="{{ $postList->id }}"
                           sort-key="{{ $postList->order_by or 'order' }}"
                           order-dir="{{ $postList->order_dir or 'asc' }}">
                </post-list>
            </div>
        </div>

    </form>

@endsection

@section('scripts')
    <script>
        var csrf = "{{ csrf_token() }}";

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

        var del = function() {
            var self = this;
            swal({
                title: 'Are you sure?',
                text: 'You will not be able to recover this post and all of its revision history!',
                type: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#DD6B55',
                confirmButtonText: 'Yes, delete it!',
                closeOnConfirm: false,
                showLoaderOnConfirm: true
            }, function () {
                $.ajax({
                    url: '/admin/api/post-lists/{{ $postList->id }}',
                    method: 'DELETE',
                    headers: { "X-CSRF-TOKEN": csrf }
                }).done(function(){
                    self.deleted = true;
                    window.location = '/admin/post-lists';
                });
            });
        };

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
