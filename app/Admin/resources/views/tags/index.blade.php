@extends('admin::layout')

@section('content')
    <div class="container-fluid container-pf-nav-pf-vertical container-pf-nav-pf-vertical-with-secondary">
        <ol class="breadcrumb">
            <li><a href="/admin">Home</a></li>
            <li class="active">Tags</li>
        </ol>
        <tags :current-user="user"></tags>
    </div>
@endsection