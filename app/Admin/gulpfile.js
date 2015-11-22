var elixir = require('laravel-elixir');

elixir(function(mix) {
    mix
        .sass('admin.scss', 'public/build/admin.css')
        .browserify('admin.js', 'public/build/admin.js')
        .scripts([
            '../../../node_modules/jquery/dist/jquery.js',
            '../../../node_modules/jquery.mousewheel/jquery.mousewheel.js',
            '../../../node_modules/bootstrap-sass/assets/javascripts/bootstrap.js',
            '../../../node_modules/select2/dist/js/select2.js',
            '../../../node_modules/bootstrap-notify/bootstrap-notify.js',
            '../../../public/vendor/ckeditor/ckeditor.js'
        ], 'public/build/vendor.js');
});
