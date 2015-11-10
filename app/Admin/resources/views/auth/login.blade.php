@extends('admin::layout')

@section('content')
    <div class="panel-heading">
        Sign in to your account
    </div>
    <div class="panel-body">
        <form class="form-horizontal" role="form" action="/admin/auth/login" method="POST">
            <input type="hidden" name="_token" value="{{ csrf_token() }}">

            <div class="form-group">
                <label class="col-md-4 control-label">E-Mail Address</label>
                <div class="col-md-6">
                    <input type="email" name="email" class="form-control">
                </div>
            </div>

            <div class="form-group">
                <label class="col-md-4 control-label">Password</label>
                <div class="col-md-6">
                    <input type="password" name="password" class="form-control">
                </div>
            </div>

            <div class="form-group">
                <div class="col-md-6 col-md-offset-4">
                    <button type="submit" class="btn btn-primary">
                        <i class="fa fa-btn fa-sign-in"></i>Login
                    </button>

                    <a class="btn btn-link">Forgot Your Password?</a>
                </div>
            </div>
        </form>
    </div>
@stop