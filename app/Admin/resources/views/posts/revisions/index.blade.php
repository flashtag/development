@extends('admin::layout')

@section('content')
    <div class="container-fluid container-pf-nav-pf-vertical container-pf-nav-pf-vertical-with-secondary">
        <post-revisions post-id="{{ $post->id }}"></post-revisions>
    </div>
@endsection