@extends('admin::layout')

@section('content')
    <page-revision post-id="{{ $page_id }}" revision-id="{{ $revision->id }}"></page-revision>
@endsection