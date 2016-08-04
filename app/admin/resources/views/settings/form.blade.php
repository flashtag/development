
@include('admin::partials.form-errors')

<div class="panel panel-default">
    <div class="panel-heading">Setting</div>
    <div class="panel-body">
        <div class="form-group">
            <label for="name">Name</label>
            <input type="text" value="{{ $setting->name or old('name') }}" name="name" id="name" class="form-control">
        </div>
        <div class="form-group">
            <label for="value">Value</label>
            <input type="text" value="{{ $setting->value or old('value') }}" name="value" id="value" class="form-control">
        </div>
    </div>
</div>
