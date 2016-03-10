@extends('flashtag::layout-home')

@section('content')
<header>
    <div class="header-content">
        <div class="header-content-inner">
            <h1>Content Management is no longer a chore</h1>
            <hr>
            <p>A CMS to simplify your work so that you can live your life. We hate convoluted user interfaces as much as you do. Try flashtag today!</p>
            <a href="#about" class="btn btn-primary btn-xl page-scroll">Find Out More</a>
        </div>
    </div>
</header>

<section class="bg-primary" id="about">
    <div class="container">
        <div class="row">
            <div class="col-lg-8 col-lg-offset-2 text-center">
                <h2 class="section-heading">We've got what you need!</h2>
                <hr class="light">
                <p class="text-faded">Flashtag has everything you need to get your website up and running in no time! All of the components are on github and free, and easy to use. You can install the stand-alone project or include the components in an existing Laravel application.</p>
                <a href="#features" class="page-scroll btn btn-default btn-xl">What about features?</a>
            </div>
        </div>
    </div>
</section>

<section id="features">
    <div class="container">
        <div class="row">
            <div class="col-lg-12 text-center">
                <h2 class="section-heading">At Your Service</h2>
                <hr class="primary">
            </div>
        </div>
    </div>
    <div class="container">
        <div class="row">
            <div class="col-lg-3 col-md-6 text-center">
                <div class="service-box">
                    <i class="fa fa-4x fa-diamond wow bounceIn text-primary"></i>
                    <h3>Solid Foundation</h3>
                    <p class="text-muted">Our code is written in PHP using the most popular modern framework.</p>
                </div>
            </div>
            <div class="col-lg-3 col-md-6 text-center">
                <div class="service-box">
                    <i class="fa fa-4x fa-paper-plane wow bounceIn text-primary" data-wow-delay=".1s"></i>
                    <h3>Ready to Ship</h3>
                    <p class="text-muted">You can use the project as-is, with the default templates.</p>
                </div>
            </div>
            <div class="col-lg-3 col-md-6 text-center">
                <div class="service-box">
                    <i class="fa fa-4x fa-newspaper-o wow bounceIn text-primary" data-wow-delay=".2s"></i>
                    <h3>Up to Date</h3>
                    <p class="text-muted">We update dependencies to keep things fresh.</p>
                </div>
            </div>
            <div class="col-lg-3 col-md-6 text-center">
                <div class="service-box">
                    <i class="fa fa-4x fa-heart wow bounceIn text-primary" data-wow-delay=".3s"></i>
                    <h3>Made with Love</h3>
                    <p class="text-muted">This is an open source project created by volunteer contributors who love what they do.</p>
                </div>
            </div>
        </div>
    </div>
</section>

<section class="no-padding" id="posts">
    <div class="container-fluid">
        <div class="row no-gutter">

            @foreach ($categories as $i => $category)
            <div class="col-lg-4 col-sm-6">
                <a href="/{{ $category->slug }}" class="portfolio-box">
                    <img src="/assets/front/creative/img/portfolio/{{$i+1}}.jpg" class="img-responsive" alt="">
                    <div class="portfolio-box-caption">
                        <div class="portfolio-box-caption-content">
                            <div class="project-category text-faded">
                                {{ $category->name }}
                            </div>
                            <div class="project-name">
                                View posts
                            </div>
                        </div>
                    </div>
                </a>
            </div>
            @endforeach

        </div>
    </div>
</section>

<aside class="bg-dark">
    <div class="container text-center">
        <div class="call-to-action">
            <h2>Free Download at Github!</h2>
            <a href="https://github.com/flashtag/flashtag/releases" class="btn btn-default btn-xl wow tada">Download Now!</a>
        </div>
    </div>
</aside>

<section id="contact">
    <div class="container">
        <div class="row">
            <div class="col-lg-8 col-lg-offset-2 text-center">
                <h2 class="section-heading">Let's Get In Touch!</h2>
                <hr class="primary">
                <p>Ready to start your next project with us? That's great! Give us a call or send us an email and we will get back to you as soon as possible!</p>
            </div>
            <div class="col-lg-4 col-lg-offset-2 text-center">
                <i class="fa fa-phone fa-3x wow bounceIn"></i>
                <p>123-456-6789</p>
            </div>
            <div class="col-lg-4 text-center">
                <i class="fa fa-envelope-o fa-3x wow bounceIn" data-wow-delay=".1s"></i>
                <p><a href="/contact">feedback@flashtag.org</a></p>
            </div>
        </div>
    </div>
</section>
@stop