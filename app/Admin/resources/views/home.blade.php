@extends('admin::layout')

@section('meta')
    <meta name="csrf" id="csrf" content="{{ csrf_token() }}">
@stop

@section('content')
    <h3>Dashboard for {{ $current_user->name }} goes here</h3>
@stop
