@extends('admin::layout')

@section('content')
    <div class="container-fluid container-pf-nav-pf-vertical container-pf-nav-pf-vertical-with-secondary">
        <post-revision post-id="{{ $post_id }}" revision-id="{{ $revision->id }}"></post-revision>
    </div>
@endsection