<!doctype html>
<html>
<head>
    <meta charset="utf-8">
    <meta http-equiv="x-ua-compatible" content="ie=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1">

    <title>@yield('title', 'Home') - Flashtag</title>

    @section('meta')
        <meta name="description" content="Flashtag is a simple developer-driven CMS.">
    @show

    <link rel="stylesheet" href="/css/flashtag.css">
</head>
<body>
    <div id="Admin">
        <nav id="Main-nav"></nav>
        <router-view></router-view>
        <footer id="Footer"></footer>
    </div>
</body>
</html>