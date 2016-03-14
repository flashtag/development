@extends('admin::layout')

@section('content')
    <page-revisions post-id="{{ $page->id }}"></page-revisions>
@endsection