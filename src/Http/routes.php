<?php

$router->resource('posts', 'PostsController', ['except' => ['create', 'edit']]);
