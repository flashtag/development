@extends('admin::layout')

@section('meta')
    <meta name="user" id="user" content="{{ $user->id }}">
    <meta name="jwt" id="jwt" content="{{ $token }}">
@stop

@section('content')
    <div id="Admin">
        <admin></admin>
    </div>
@stop

@section('scripts')
    <script src="/assets/admin/admin.js"></script>
@stop