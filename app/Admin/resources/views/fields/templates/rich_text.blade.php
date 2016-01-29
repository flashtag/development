
<label for="{{ $field->name }}">{{ $field->label }}</label>
<textarea name="fields[{{$field->id}}]" id="{{ $field->name }}" class="form-control rich-editor">{!! $post->fields->where('id', $field->id)->first()->pivot->value !!}</textarea>
