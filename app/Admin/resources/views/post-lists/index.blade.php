@extends('admin::layout')

@section('content')
    <post-lists :current-user="user"></post-lists>
@endsection