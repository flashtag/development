
<label for="{{ $field->name }}">{{ $field->label }}</label>
<input type="text" name="fields[{{$field->id}}]" id="{{ $field->name }}" value="{{ $post->fields->where('id', $field->id)->first()->pivot->value }}" class="form-control">
