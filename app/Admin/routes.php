<?php

$router->get('/', ['middleware' => 'auth', function () {
    return view('admin::admin');
}]);
