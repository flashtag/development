<?php

namespace Flashtag\Admin\Http\Middleware;

use Closure;

class Administrator
{
    /**
     * Handle an incoming request.
     *
     * @param \Illuminate\Http\Request $request
     * @param \Closure $next
     * @return mixed
     */
    public function handle($request, Closure $next)
    {
        if (! $request->user()->admin) {
            return response("Nope.", 403);
        }

        return $next($request);
    }
}
