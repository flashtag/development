@extends('admin::layout')

@section('content')
    <ol class="breadcrumb">
        <li><a href="/admin">Home</a></li>
        <li class="active">Posts</li>
    </ol>
    
    <posts :current-user="user"></posts>
@endsection
