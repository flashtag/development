@extends ('master')

@section ('html-tag') <html itemscope itemtype="http://schema.org/Article"> @stop

@section ('title') {{ $post->title }} @stop

@section ('meta')
    <meta name="description" content="{{ $meta->description }}" />

    {{-- Schema.org markup for Google+ --}}
    <meta itemprop="name" content="{{ $post->title }}">
    <meta itemprop="description" content="{{ $meta->description }}">
    <meta itemprop="image" content="{{ $meta->image }}">

    {{-- Twitter Card data --}}
    <meta name="twitter:card" content="summary">
    <meta name="twitter:site" content="{{ $config->twitter_site }}">
    <meta name="twitter:title" content="{{ $post->title }}">
    <meta name="twitter:description" content="{{ $meta->description }}">
    <meta name="twitter:creator" content="{{ $config->twitter_creator }}">
    <meta name="twitter:image:src" content="{{ $meta->image }}">

    {{-- Open Graph data for Facebook and Pinterest --}}
    <meta property="og:site_name" content="{{ $config->site_name }}" />
    <meta property="og:type" content="article" />
    <meta property="og:title" content="{{ $post->title }}" />
    <meta property="og:url" content="{{ $meta->url }}" />
    <meta property="og:description" content="{{ $meta->description }}" />
    <meta property="og:image" content="{{ $meta->image }}" />
    <meta property="og:rating" content="{{ $post->getRating() }}">
    <meta property="og:rating_scale" content="100">
    <meta property="og:rating_count" content="{{ $post->ratings->count() }}">
    <meta property="article:published_time" content="{{ $post->start_showing_at ? $post->start_showing_at->toIso8601String() : $post->created_at->toIso8601String() }}" />
    <meta property="article:modified_time" content="{{ $post->updated_at->toIso8601String() }}" />
    <meta property="article:section" content="{{ $post->category ? $post->category->title : '' }}" />
    @foreach ($post->tags as $tag)
        <meta property="article:tag" content="{{ $tag->name }}" />
    @endforeach
    {{-- Facebok-specific --}}
    @if ($meta->facebook_page_id) <meta property="fb:page_id" content="{{ $config->facebook_page_id }}" /> @endif
    @if ($meta->facebook_admins) <meta property="fb:admins" content="{{ $config->facebook_admins }}" /> @endif
    @if ($meta->facebook_app_id) <meta property="fb:app_id" content="{{ $config->facebook_app_id }}" /> @endif
@stop
