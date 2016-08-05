@extends('admin::layout')


@section('content')
    <div class="container-fluid container-pf-nav-pf-vertical container-pf-nav-pf-vertical-with-secondary">
        <ol class="breadcrumb">
            <li><a href="/admin">Home</a></li>
            <li><a href="/admin/categories">Categories</a></li>
            <li class="active">Create</li>
        </ol>


        <form class="Category EditForm" action="{{ route('admin::categories.store') }}" method="POST" enctype="multipart/form-data">
            {{ csrf_field() }}

            <section class="info row">
                <div class="col-md-6 clearfix">
                    <h1 class="Form__title">Create a New Category</h1>
                </div>
                <div class="col-md-6 clearfix">
                    <div class="action-buttons">
                        <button type="submit" class="btn btn-primary"><i class="fa fa-save"></i> Save</button>
                        <a href="/admin/categories" class="btn btn-default"><i class="fa fa-close"></i> Close</a>
                    </div>
                </div>
            </section>

            @include('admin::categories.form')

        </form>
    </div>
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
                    url: '/api/categories/{{ $category->id }}',
                    method: 'DELETE',
                    headers: { Authorization: localStorage.getItem('jwt-token') }
                }).done(function(){
                    self.deleted = true;
                    window.location = '/admin/categories';
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
