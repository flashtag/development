
<div class="panel panel-default">
    <div class="panel-heading">Field</div>
    <div class="panel-body">
        <div class="form-group">
            <label for="label">Label</label>
            <input type="text" value="{{ $field->label or old('label') }}" name="label" id="label" class="form-control">
        </div>
        <div class="form-group">
            <label for="name">Name</label>
            <input type="text" value="{{ $field->name or old('name') }}" name="name" id="name" class="form-control">
        </div>
        <div class="form-group">
            <label for="template">Template</label>
            <select name="template" id="template" class="form-control">
                <option value="" disabled selected>Select a template...</option>
                    <option value="string" {{ $field->template == 'string' ? 'selected' : '' }}>
                        String
                    </option>
                <option value="rich_text" {{ $field->template == 'rich_text' ? 'selected' : '' }}>
                    Rich text
                </option>
            </select>
        </div>
        <div class="form-group">
            <label for="description">Description</label>
            <textarea name="description" id="description" class="form-control rich-editor">
                {{ $field->description or old('description') }}
            </textarea>
        </div>
    </div>
</div>
