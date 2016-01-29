
<?php $post_field = $post->fields ? $post->fields->where('id', $field->id)->first() : null; ?>

<label for="{{ $field->name }}">{{ $field->label }}</label>
<textarea name="fields[{{$field->id}}]" id="{{ $field->name }}" class="form-control rich-editor">
    {!! $post_field ? $post_field->pivot->value : '' !!}
</textarea>
