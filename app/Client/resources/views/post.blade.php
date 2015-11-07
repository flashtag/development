@extends('master')

@section('html-tag')
<html itemscope itemtype="http://schema.org/Article">
@stop

@section('title') {{ $post->title }} @stop

@section('meta')
@include('partials.post-meta')
@stop

@section ('content')
    <h1>{{ $post->title }}</h1>
@stop