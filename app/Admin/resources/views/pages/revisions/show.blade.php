@extends('admin::layout')

@section('content')
    <div class="container-fluid container-pf-nav-pf-vertical container-pf-nav-pf-vertical-with-secondary">
        <page-revision post-id="{{ $page_id }}" revision-id="{{ $revision->id }}"></page-revision>
    </div>
@endsection