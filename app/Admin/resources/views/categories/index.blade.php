@extends('admin::layout')

@section('content')
    <categories :current-user="user"></categories>
@endsection