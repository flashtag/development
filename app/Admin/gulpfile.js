var elixir = require('laravel-elixir');

elixir(function(mix) {
    mix.sass('admin.scss', 'build/css/admin.css', 'sass');
    mix.browserify('admin.js', 'build/js/admin.js', 'js');
});
