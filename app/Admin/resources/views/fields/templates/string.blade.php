
<label for="{{ $field->name }}">{{ $field->label }}</label>
<input type="text" name="fields[{{$field->id}}]" id="{{ $field->name }}" class="form-control"
       value="{{ count($post->fields) ? $post->fields->where('id', $field->id)->first()->pivot->value : '' }}">
