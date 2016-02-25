@extends('admin::layout')

@section('styles')
    <style>
        body {
            background-color: #fafafa;
            color: #757575;
        }
        .password-form {
            padding: 0px 15px;
        }
        .panel {
            box-shadow: 0 2px 2px 0 rgba(0,0,0,.14),0 3px 1px -2px rgba(0,0,0,.2),0 1px 5px 0 rgba(0,0,0,.12);
        }
        .panel-heading {
            text-align: center;
        }
        .buttons {
            margin-top: 20px;
            margin-bottom: 0px;
        }
    </style>
@stop

@section('content')
    <section class="container" style="margin-top: 100px;">
        <div class="col-md-6 col-md-offset-3">
            @if (session()->has('status'))
                <ul class="alert alert-info list-unstyled">
                    <li>{{ session('status') }}</li>
                </ul>
            @endif
            @if (count($errors) > 0)
                <ul class="alert alert-danger list-unstyled">
                    @foreach ($errors->all() as $error)
                        <li>{{ $error }}</li>
                    @endforeach
                </ul>
            @endif
            <div class="panel panel-default">
                <div class="panel-heading"><i class="fa fa-key"></i> Reset your password</div>
                <div class="panel-body">
                    <div class="password-form">
                        <form class="form-horizontal" role="form" method="POST" action="/admin/password/email">
                            {!! csrf_field() !!}

                            <div class="form-group">
                                <input type="email" name="email" placeholder="Email" class="form-control" value="{{ old('email') }}">
                            </div>

                            <div class="form-group buttons">
                                <button type="submit" class="btn btn-primary">
                                    <i class="fa fa-btn fa-sign-in"></i> Send password reset link
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    </section>
@stop
