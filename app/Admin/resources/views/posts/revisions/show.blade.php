@extends('admin::layout')

@section('content')
    <post-revision post-id="{{ $post_id }}" revision-id="{{ $revision->id }}"></post-revision>
@endsection