<template>
    <label for="{{ name }}">{{ label }}</label>
    <input type="text" name="{{ name }}" id="{{ name }}" v-model="value" class="form-control">
</template>

<script>
    export default {

        props: ['label', 'name', 'value']

    }
</script>