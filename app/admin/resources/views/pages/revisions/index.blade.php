@extends('admin::layout')

@section('content')
    <div class="container-fluid container-pf-nav-pf-vertical container-pf-nav-pf-vertical-with-secondary">
        <page-revisions post-id="{{ $page->id }}"></page-revisions>
    </div>
@endsection