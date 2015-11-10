<!doctype html>
<html>
<head>
    <meta charset="utf-8">
    <meta http-equiv="x-ua-compatible" content="ie=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1">

    <title>Flashtag</title>
    <meta name="description" content="Flashtag is a simple developer-driven CMS.">
    @yield('meta')

    <link href="https://maxcdn.bootstrapcdn.com/bootswatch/3.3.5/paper/bootstrap.min.css" rel="stylesheet" integrity="sha256-hMIwZV8FylgKjXnmRI2YY0HLnozYr7Cuo1JvRtzmPWs= sha512-k+wW4K+gHODPy/0gaAMUNmCItIunOZ+PeLW7iZwkDZH/wMaTrSJTt7zK6TGy6p+rnDBghAxdvu1LX2Ohg0ypDw==" crossorigin="anonymous">
    {{--<link rel="stylesheet" href="/assets/admin/admin.css">--}}
    @yield('styles')
</head>
<body>

@yield('content')

@yield('scripts')

</body>
</html>