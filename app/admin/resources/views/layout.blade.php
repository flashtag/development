<!--

         @@@@@@@@@@@@@@@@@@@@@@@@@@@@
      @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
     @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
   @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
  @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
  @@@@@@@@@@@@@@  '.@@@@@@@@@@@@@@@@@.--.@@@@@@@@@
    @@@@@@@@\   @@  ¯ @@@@@@@@@@@ '¯¯ ___..@@@@@@
     @@@@@@@@|                 @    .'@@@@@@@@@@
        @@@@@@\                    /@@@@@@@@
               \                  /
               |   .--'|__|'--.   |
               |  /.--'/  \'--.\  |
   __  ___     /      /____\      \     ___
 _(  )(   )_  |     .' .''. '.     |  _(   )__  __      __
(           )_|    |__/    \__|    |_(        )(  )_   (
             /                      \__             )_(¯
_______.---./    .'                    \_.--._ ___________
  --''¯        _/    __                       '--..
             ''    .'

-->
<!doctype html>
<!--[if IE 9]><html lang="en-us" class="ie9 layout-pf layout-pf-fixed"><![endif]-->
<!--[if gt IE 9]><!-->
<html lang="en-us" class="layout-pf layout-pf-fixed">
<!--<![endif]-->
<head>
    <title>{{ settings('name') }}</title>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=Edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">

    @include('admin::partials.icons')

    @yield('meta')

    <link rel="stylesheet" href="/assets/admin/admin.css" >
    @yield('styles')

    <script>window.CKEDITOR_BASEPATH = '/assets/vendor/admin/ckeditor/';</script>
    <script src="/assets/admin/vendor.js"></script>
    <script src="//cdnjs.cloudflare.com/ajax/libs/jquery.matchHeight/0.6.0/jquery.matchHeight-min.js"></script>
    <script src="//cdnjs.cloudflare.com/ajax/libs/c3/0.4.10/c3.min.js"></script>
    <script src="//cdnjs.cloudflare.com/ajax/libs/d3/3.5.0/d3.min.js"></script>
    <script src="/assets/vendor/admin/patternfly/js/patternfly.min.js"></script>
</head>
<body class="cards-pf" id="Admin">

    @include('admin::partials.navbar')

    @include('admin::partials.nav-vertical')


        @yield('content')
    </div>

    <script src="/assets/admin/admin.js"></script>
    <script>
    $(document).ready(function() {
        // matchHeight the contents of each .card-pf and then the .card-pf itself
        $(".row-cards-pf > [class*='col'] > .card-pf .card-pf-title").matchHeight();
        $(".row-cards-pf > [class*='col'] > .card-pf > .card-pf-body").matchHeight();
        $(".row-cards-pf > [class*='col'] > .card-pf > .card-pf-footer").matchHeight();
        $(".row-cards-pf > [class*='col'] > .card-pf").matchHeight();

        // initialize tooltips
        $('[data-toggle="tooltip"]').tooltip();

        // Initialize the vertical navigation
        $().setupVerticalNavigation(true);
    });
    </script>

    @yield('scripts')
</body>
</html>
