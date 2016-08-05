<template>
    <label for="{{ field.name }}">{{ field.label }}</label>
    <input type="text" name="{{ field.name }}" id="{{ field.name }}" v-model="field.value" class="form-control">
</template>

<script>
    export default {

        props: {
            field: Object
        }

    }
</script>