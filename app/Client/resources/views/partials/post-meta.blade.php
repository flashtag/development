@extends ('flashtag')

@section ('html') <html itemscope itemtype="http://schema.org/Article"> @stop

@section ('title') {{ $meta->title }} @stop

@section ('meta')
    <meta name="description" content="{{ $meta->description }}" />

    <!-- Schema.org markup for Google+ -->
    <meta itemprop="name" content="{{ $meta->title }}">
    <meta itemprop="description" content="{{ $meta->description }}">
    <meta itemprop="image" content="{{ $meta->image }}">

    <!-- Twitter Card data -->
    <meta name="twitter:card" content="{{ $meta->twitter_card }}">
    <meta name="twitter:site" content="{{ $meta->twitter_site }}">
    <meta name="twitter:title" content="{{ $meta->title }}">
    <meta name="twitter:description" content="{{ $meta->description }}">
    <meta name="twitter:creator" content="{{ $meta->twitter_creator }}">
    <meta name="twitter:image:src" content="{{ $meta->image }}">

    <!-- Open Graph data -->
    <meta property="og:title" content="{{ $meta->title }}" />
    <meta property="og:type" content="{{ $meta->og_type }}" />
    <meta property="og:url" content="{{ $meta->url }}" />
    <meta property="og:image" content="{{ $meta->image }}" />
    <meta property="og:description" content="{{ $meta->description }}" />
    <meta property="og:site_name" content="{{ $meta->site_name }}" />
    <meta property="article:published_time" content="{{ $meta->published_time }}" />
    <meta property="article:modified_time" content="{{ $meta->modified_time }}" />
    <meta property="article:section" content="{{ $meta->section }}" />
    <meta property="article:tag" content="{{ $meta->tag }}" />
    <meta property="fb:admins" content="{{ $meta->facebook_admins }}" />
    <meta property="fb:app_id" content="{{ $meta->facebook_app_id }}" />
@stop
