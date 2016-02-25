@extends('admin::layout')

@section('content')
    <posts :current-user="user"></posts>
@endsection