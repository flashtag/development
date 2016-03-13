@extends('admin::layout')

@section('content')
    <post-revisions post-id="{{ $post->id }}"></post-revisions>
@endsection