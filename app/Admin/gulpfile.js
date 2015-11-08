var elixir = require('laravel-elixir');

elixir(function(mix) {
    mix.sass('admin.scss', 'build/admin.css');
    mix.browserify('admin.js', 'build/admin.js');
});
