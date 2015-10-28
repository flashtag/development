<?php

namespace Flashtag\Api\Http\Controllers\V1;

use Dingo\Api\Routing\Helpers;
use Illuminate\Contracts\Pagination\Paginator;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller as BaseController;

abstract class Controller extends BaseController
{
    use Helpers;

    protected function appendPaginationLinks(Paginator $paginator, Request $request)
    {
        if ($request->has('count')) {
            $paginator->appends(['count' => $request->get('count')]);
        }

        if ($request->has('include')) {
            $paginator->appends(['include' => $request->get('include')]);
        }
    }
}
