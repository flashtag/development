@extends('admin::layout')

@section('meta')
    <meta name="user" id="user" content="{{ $user->id }}">
    <meta name="jwt" id="jwt" content="{{ $token }}">
@stop

@section('content')
    <div id="Admin">

    </div>
@stop

@section('scripts')
    <script>window.CKEDITOR_BASEPATH = '/assets/vendor/admin/ckeditor/';</script>
    <script src="/assets/admin/vendor.js"></script>
    <script src="/assets/admin/admin.js"></script>
@stop