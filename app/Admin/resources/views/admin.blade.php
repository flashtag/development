@extends('admin::layout')

@section('meta')
    <meta name="user" id="user" content="{{ $user->id }}">
    <meta name="jwt" id="jwt" content="{{ $token }}">
@stop

@section('content')
    <div id="Admin">
        <section class="nav-row">
            <nav-component></nav-component>
        </section>
        <section class="container">
            <router-view :current-user="user"></router-view>
        </section>
        <section class="footer-row">
            <footer-component></footer-component>
        </section>
    </div>
@stop

@section('scripts')
    <script src="/assets/admin/admin.js"></script>
@stop