@extends('admin::layout')

@section('content')
    <div class="container-fluid container-pf-nav-pf-vertical container-pf-nav-pf-vertical-with-secondary">
        <ol class="breadcrumb">
            <li><a href="/admin">Home</a></li>
            <li><a href="/admin/users">Users</a></li>
            <li class="active">{{ $user->name }}</li>
        </ol>

        <form class="Category EditForm" action="{{ route('admin.users.update', [$user->id]) }}" method="POST">
            {{ csrf_field() }}
            {{ method_field('PUT') }}

            <section class="info row">
                <div class="col-md-6">
                    <h1 class="Form__title">{{ $user->name }}</h1>
                </div>
                <div class="col-md-6 clearfix">
                    <div class="action-buttons">
                        <button type="submit" class="btn btn-primary"><i class="fa fa-save"></i> Save</button>
                        <a href="#delete" class="btn btn-danger"><i class="fa fa-trash"></i> Delete</a>
                        <a href="/admin/users" class="btn btn-default"><i class="fa fa-close"></i> Close</a>
                    </div>
                </div>
            </section>

            @include('admin::users.form')

        </form>
    </div>
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
                text: 'You will not be able to recover this user!',
                type: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#DD6B55',
                confirmButtonText: 'Yes, delete it!',
                closeOnConfirm: false,
                showLoaderOnConfirm: true
            }, function () {
                $.ajax({
                    url: '/admin/api/users/{{ $user->id }}',
                    method: 'DELETE',
                    headers: { "X-CSRF-TOKEN": csrf }
                }).done(function(){
                    self.deleted = true;
                    window.location = '/admin/users';
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
