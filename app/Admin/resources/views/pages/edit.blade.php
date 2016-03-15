@extends('admin::layout')

@section('content')
    <ol class="breadcrumb">
        <li><a href="/admin">Home</a></li>
        <li><a href="/admin/pages">Pages</a></li>
        <li class="active">{{ $page->title }}</li>
    </ol>

    <form class="Post EditForm" action="{{ route('admin.pages.update', [$page->id]) }}" method="POST" enctype="multipart/form-data">
        {{ csrf_field() }}
        {{ method_field('PUT') }}

        <section class="info row">
            <div class="col-md-6 clearfix">
                <!-- TODO: Revision history
                <a href="/admin/pages/{{ $page->id }}/revisions" class="btn btn-link">
                    <i class="fa fa-history"></i> Revision history
                </a>
                -->
            </div>
            <div class="col-md-6 clearfix">
                <div class="action-buttons">
                    <button class="btn btn-primary" type="submit"><i class="fa fa-save"></i> Save</button>
                    <a href="#delete" id="delete" class="btn btn-danger"><i class="fa fa-trash"></i> Delete</a>
                    <a href="/admin/pages" class="btn btn-default"><i class="fa fa-close"></i> Close</a>
                </div>
            </div>
        </section>

        @include('admin::pages.form')

    </form>

@endsection

@section('scripts')
    <script>
        // CSRF token
        var csrf = "{{ csrf_token() }}";

        $(document).ready(function(){

            // Unlock the page when user leaves
            $(window).unload(function(){
                unlock();
            });

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

        function unlock(){
            $.ajax({
                url: "/admin/api/pages/{{ $page->id }}/unlock",
                method: "PATCH",
                headers: { "X-CSRF-TOKEN": csrf }
            });
        }

        function del(){
            var self = this;
            swal({
                title: 'Are you sure?',
                text: 'You will not be able to recover this page and all of its revision history!',
                type: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#DD6B55',
                confirmButtonText: 'Yes, delete it!',
                closeOnConfirm: false,
                showLoaderOnConfirm: true
            }, function () {
                $.ajax({
                    url: '/admin/api/pages/{{ $page->id }}',
                    method: 'DELETE',
                    headers: { "X-CSRF-TOKEN": csrf }
                }).done(function(){
                    self.deleted = true;
                    window.location = '/admin/pages';
                });
            });
        }

        function notify(type, message){
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
        }
    </script>
@endsection