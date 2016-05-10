@extends('flashtag::layout')

@section ('html-tag') <html itemscope itemtype="http://schema.org/Article"> @stop
@section ('title') {{ $post->title }} @stop
@section('meta') @include('flashtag::partials.post-meta') @stop

@section('content')
    <!-- Page Header -->
    <!-- Set your background image for this header on the line below. -->
    <header class="intro-header" style="background-image: url('/assets/themes/clean-creative/img/post-bg.jpg')">
        <div class="container">
            <div class="row">
                <div class="col-lg-8 col-lg-offset-2 col-md-10 col-md-offset-1">
                    <div class="post-heading">
                        <h1>{{ $post->title }}</h1>
                        <h2 class="subheading">{{ $post->subtitle }}</h2>
                        <span class="meta">
                            Published
                            @if ($post->show_author && $post->author) by <a href="{{ route('authors.show', [$post->author->slug]) }}">{{ $post->author->name or 'Flashtag' }}</a> @endif
                            on {{ $post->publishedOn() }}
                            @if ($post->category) in <a href="{{ route('categories.show', [$post->category->slug]) }}">{{ $post->category->name }}</a> @endif
                        </span>
                        <span class="tags">
                            @foreach ($post->tags as $tag)
                                <a href="{{ route('topics.show', [$tag->slug]) }}" class="label label-default">{{ $tag->name }}</a>
                            @endforeach
                        </span>
                    </div>
                </div>
            </div>
        </div>
    </header>

    <!-- Post Content -->
    <article>
        <div class="container">
            <div class="row">
                <div class="col-lg-8 col-lg-offset-2 col-md-10 col-md-offset-1">
                    {!! $post->body !!}
                </div>
            </div>
        </div>
    </article>
@stop
