<!DOCTYPE html>
<html lang="en">

<head>

    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="description" content="">
    <meta name="author" content="">

    <title>Flashtag</title>

    <link href="/assets/front/clean-blog/css/bootstrap.min.css" rel="stylesheet">
    <link href="/assets/front/clean-blog/css/clean-blog.min.css" rel="stylesheet">
    <link href="https://maxcdn.bootstrapcdn.com/font-awesome/4.1.0/css/font-awesome.min.css" rel="stylesheet" type="text/css">
    <link href='https://fonts.googleapis.com/css?family=Lora:400,700,400italic,700italic' rel='stylesheet' type='text/css'>
    <link href='https://fonts.googleapis.com/css?family=Open+Sans:300italic,400italic,600italic,700italic,800italic,400,300,600,700,800' rel='stylesheet' type='text/css'>

    <!--[if lt IE 9]>
        <script src="https://oss.maxcdn.com/libs/html5shiv/3.7.0/html5shiv.js"></script>
        <script src="https://oss.maxcdn.com/libs/respond.js/1.4.2/respond.min.js"></script>
    <![endif]-->
</head>

<body>
    @include('front::clean-blog.partials.nav')

    @yield('content')

    <hr>

    @include('front::clean-blog.partials.footer')

    <script src="/assets/front/clean-blog/js/jquery.js"></script>
    <script src="/assets/front/clean-blog/js/bootstrap.min.js"></script>
    <script src="/assets/front/clean-blog/js/clean-blog.min.js"></script>
    @yield('scripts')
</body>
</html>
