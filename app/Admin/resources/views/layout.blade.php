<!doctype html>
<html>
<head>
    <meta charset="utf-8">
    <meta http-equiv="x-ua-compatible" content="ie=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1">

    <title>Flashtag</title>
    <meta name="description" content="Flashtag is a simple developer-driven CMS.">

    @include('admin::partials.icons')

    @yield('meta')

    <link rel="stylesheet" href="/assets/admin/admin.css">
    @yield('styles')
</head>
<body>

<section class="Main" id="Admin">
    @if (Auth::check())
        @include('admin::partials.nav-top')
        <div class="Main__menu">
            @include('admin::partials.nav-side')
        </div>
    @endif
    <div class="Main__container">
        <div class="Main__content">
            @yield('content')
        </div>
    </div>
</section>

<script>window.CKEDITOR_BASEPATH = '/assets/vendor/admin/ckeditor/';</script>
<script src="/assets/admin/vendor.js"></script>
<script src="/assets/admin/admin.js"></script>
@yield('scripts')

</body>
</html>