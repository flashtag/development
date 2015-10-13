<?php

namespace Scribbl\Api\Http\Controllers;

use Illuminate\Routing\Controller as BaseController;
use Illuminate\Foundation\Validation\ValidatesRequests;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Scribbl\Api\Response;

abstract class Controller extends BaseController
{
    use AuthorizesRequests, ValidatesRequests;
}
