@extends('admin::layout')

@section('content')
    <ol class="breadcrumb">
        <li><a href="#">Home</a></li>
        <li class="active">Post Fields</li>
    </ol>
    
    <fields :current-user="user"></fields>
@endsection
