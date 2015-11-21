<template>
    <label for="{{ field.name }}">{{ field.label }}</label>
    <textarea name="{{ field.name }}" id="{{ field.name }}" class="form-control rich-editor" v-rich-editor="field.value"></textarea>
</template>

<script>
    export default {

        props: {
            field: Object
        }

    }
</script>