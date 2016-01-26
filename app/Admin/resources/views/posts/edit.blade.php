@extends('admin::layout')

@section('content')
    <posts-edit post-id="{{ $id }}" :current-user="user"></posts-edit>
@endsection