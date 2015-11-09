@extends('admin::layout')

@section('content')
    <h1>Login</h1>
    <form method="POST" action="/admin/auth/login">
        {!! csrf_field() !!}

        <div class="form-group">
            <label for="email" class="form-control">Email</label>
            <input type="email" name="email" id="email" value="{{ old('email') }}">
        </div>

        <div class="form-group">
            <label for="password" class="form-control">Password</label>
            <input type="password" name="password" id="password">
        </div>

        <div class="form-group">
            <label>
                <input type="checkbox" name="remember"> Remember Me
            </label>
        </div>

        <div class="form-group">
            <button type="submit">Login</button>
        </div>
    </form>
@stop