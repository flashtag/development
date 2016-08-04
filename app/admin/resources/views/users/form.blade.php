
@include('admin::partials.form-errors')

<div class="panel panel-default">
    <div class="panel-heading">Author</div>
    <div class="panel-body">
        <div class="form-group">
            <label for="name">Name</label>
            <input type="text" value="{{ $user->name or old('name') }}" name="name" id="name" class="form-control">
        </div>
        <div class="form-group">
            <label for="email">Email</label>
            <input type="email" value="{{ $user->email or old('email') }}" name="email" id="email" class="form-control">
        </div>
        <div class="form-group">
            <label for="password">Set Password</label>
            <input type="password" name="password" id="password" class="form-control">
        </div>
        <div class="form-group">
            <label for="password_confirmation">Confirm Password</label>
            <input type="password" name="password_confirmation" id="password_confirmation" class="form-control">
        </div>
        <div class="form-group">
            <label for="admin">Admin?</label>
            <div class="switch">
                <input id="admin" name="admin" class="cmn-toggle cmn-toggle-yes-no" type="checkbox" value="1"
                        {{ $user->admin ? 'checked' : '' }}>
                <label for="admin" data-on="Yes" data-off="No"></label>
            </div>
        </div>
    </div>
</div>
