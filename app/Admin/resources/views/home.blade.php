@extends('admin::layout')

@section('meta')
    <meta name="user" id="user" content="{{ $current_user->id }}">
    <meta name="jwt" id="jwt" content="{{ Session::get('jwt') }}">
    <meta name="csrf" id="csrf" content="{{ csrf_token() }}">
@stop

@section('content')
    <h3>Dashboard for {{ $current_user->name }} goes here</h3>
@stop
