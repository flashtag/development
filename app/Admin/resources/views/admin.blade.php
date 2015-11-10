@extends('admin::layout')

@section('meta')
    <meta name="jwt" id="jwt" content="{{ $token }}">
@stop

@section('content')
    <div id="Admin">
        <nav id="Main-nav"></nav>
        <router-view></router-view>
        <footer id="Footer"></footer>
    </div>
@stop

@section('scripts')
    <script src="/assets/admin/admin.js"></script>
@stop