
<meta name="description" content="{{ $post->meta_description }}" />

{{-- Schema.org markup for Google+ --}}
<meta itemprop="name" content="{{ $post->title }}">
<meta itemprop="description" content="{{ $post->meta_description }}">
<meta itemprop="image" content="{{ $post->image }}">

{{-- Twitter Card data --}}
<meta name="twitter:card" content="summary">
<meta name="twitter:site" content="{{ settings('name') }}">
<meta name="twitter:title" content="{{ $post->title }}">
<meta name="twitter:description" content="{{ $post->meta_description }}">
<meta name="twitter:creator" content="{{ settings('twitter_user') }}">
<meta name="twitter:image:src" content="{{ $post->image }}">

{{-- Open Graph data for Facebook and Pinterest --}}
<meta property="og:site_name" content="{{ settings('name') }}" />
<meta property="og:type" content="article" />
<meta property="og:title" content="{{ $post->title }}" />
<meta property="og:url" content="{{ $post->canonical }}" />
<meta property="og:description" content="{{ $post->meta_description }}" />
<meta property="og:image" content="{{ $post->image }}" />
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
@if (settings('facebook_page_id')) <meta property="fb:page_id" content="{{ settings('facebook_page_id') }}" /> @endif
@if (settings('facebook_admins')) <meta property="fb:admins" content="{{ settings('facebook_admins') }}" /> @endif
@if (settings('facebook_app_id')) <meta property="fb:app_id" content="{{ settings('facebook_app_id') }}" /> @endif
