var elixir = require('laravel-elixir');

/*
 |--------------------------------------------------------------------------
 | Elixir Asset Management
 |--------------------------------------------------------------------------
 |
 | Elixir provides a clean, fluent API for defining some basic Gulp tasks
 | for your Laravel application. By default, we are compiling the Sass
 | file for our application, as well as publishing vendor resources.
 |
 */

elixir(function(mix) {
    // Admin
    mix
        .sass('admin/admin.scss', 'resources/assets/build/admin/admin.css')
        .browserify('admin.js', 'resources/assets/build/admin/admin.js')
        .scripts([
            '../../../app/Admin/node_modules/jquery/dist/jquery.js',
            '../../../app/Admin/node_modules/jquery.mousewheel/jquery.mousewheel.js',
            '../../../app/Admin/node_modules/bootstrap-sass/assets/javascripts/bootstrap.js',
            '../../../app/Admin/node_modules/select2/dist/js/select2.js',
            '../../../app/Admin/node_modules/bootstrap-notify/bootstrap-notify.js',
            '../../../app/Admin/public/vendor/ckeditor/ckeditor.js'
        ], 'resources/assets/build/admin/vendor.js');
});
