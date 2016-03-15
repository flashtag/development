@extends('flashtag::layout')

@section('content')
    <!-- Page Header -->
    <!-- Set your background image for this header on the line below. -->
    <header class="intro-header" style="background-image: url({{ $page->image or '/assets/themes/clean-creative/img/about-bg.jpg' }})">
        <div class="container">
            <div class="row">
                <div class="col-lg-8 col-lg-offset-2 col-md-10 col-md-offset-1">
                    <div class="page-heading">
                        <h1>{{ $page->title }}</h1>
                        <hr class="small">
                        <span class="subheading">{{ $page->subtitle }}</span>
                    </div>
                </div>
            </div>
        </div>
    </header>

    <!-- Main Content -->
    <div class="container">
        <div class="row">
            <div class="col-lg-8 col-lg-offset-2 col-md-10 col-md-offset-1">
                {!! $page->body !!}
            </div>
        </div>
    </div>
@stop
