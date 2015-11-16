var elixir = require('laravel-elixir');

elixir(function(mix) {
    mix.sass('admin.scss', 'build/admin.css');
    mix.browserify('admin.js', 'build/admin.js');
    mix.scripts([
        '../../../node_modules/jquery/dist/jquery.js',
        '../../../node_modules/jquery.mousewheel/jquery.mousewheel.js',
        '../../../node_modules/bootstrap-sass/assets/javascripts/bootstrap.js',
        '../../../node_modules/select2/dist/js/select2.js',
        '../vendor/ckeditor/ckeditor.js'
    ], 'build/vendor.js');
});
