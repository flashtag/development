@extends('admin::layout')

@section('content')
    <div class="container-fluid container-cards-pf container-pf-nav-pf-vertical container-pf-nav-pf-vertical-with-secondary">
        <posts :current-user="user"></posts>
    </div>
@endsection
