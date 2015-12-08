<!doctype html>
<html>
<head>
    <meta charset="utf-8">
    <meta http-equiv="x-ua-compatible" content="ie=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1">

    <title>Flashtag</title>
    <meta name="description" content="Flashtag is a simple developer-driven CMS.">

    <link rel="apple-touch-icon" sizes="57x57" href="/assets/admin/icons/apple-touch-icon-57x57.png">
    <link rel="apple-touch-icon" sizes="60x60" href="/assets/admin/icons/apple-touch-icon-60x60.png">
    <link rel="apple-touch-icon" sizes="72x72" href="/assets/admin/icons/apple-touch-icon-72x72.png">
    <link rel="apple-touch-icon" sizes="76x76" href="/assets/admin/icons/apple-touch-icon-76x76.png">
    <link rel="apple-touch-icon" sizes="114x114" href="/assets/admin/icons/apple-touch-icon-114x114.png">
    <link rel="apple-touch-icon" sizes="120x120" href="/assets/admin/icons/apple-touch-icon-120x120.png">
    <link rel="apple-touch-icon" sizes="144x144" href="/assets/admin/icons/apple-touch-icon-144x144.png">
    <link rel="apple-touch-icon" sizes="152x152" href="/assets/admin/icons/apple-touch-icon-152x152.png">
    <link rel="apple-touch-icon" sizes="180x180" href="/assets/admin/icons/apple-touch-icon-180x180.png">
    <link rel="icon" type="image/png" href="/assets/admin/icons/favicon-32x32.png" sizes="32x32">
    <link rel="icon" type="image/png" href="/assets/admin/icons/favicon-194x194.png" sizes="194x194">
    <link rel="icon" type="image/png" href="/assets/admin/icons/favicon-96x96.png" sizes="96x96">
    <link rel="icon" type="image/png" href="/assets/admin/icons/android-chrome-192x192.png" sizes="192x192">
    <link rel="icon" type="image/png" href="/assets/admin/icons/favicon-16x16.png" sizes="16x16">
    <link rel="manifest" href="/assets/admin/manifest.json">
    <link rel="mask-icon" href="/assets/admin/icons/safari-pinned-tab.svg" color="#5bbad5">
    <meta name="apple-mobile-web-app-title" content="Flashtag">
    <meta name="application-name" content="Flashtag">
    <meta name="msapplication-TileColor" content="#00aba9">
    <meta name="msapplication-TileImage" content="/assets/admin/icons/mstile-144x144.png">
    <meta name="theme-color" content="#ffffff">

    @yield('meta')

    <link rel="stylesheet" href="/assets/admin/admin.css">
    @yield('styles')
</head>
<body>

@yield('content')

@yield('scripts')

</body>
</html>