<template>
    <label for="{{ name }}">{{ label }}</label>
    <textarea name="{{ name }}" id="{{ name }}" class="form-control rich-editor" v-model="value"></textarea>
</template>

<script>
    export default {

        props: ['label', 'name', 'value']

    }
</script>