<template>
    <ul class="pagination">
        <li :class="{ 'disabled': !hasPrevious() }">
            <a href="#">&laquo;</a>
        </li>
        <li v-for="i in pagination.total_pages" :class="{ 'active': i+1 == pagination.current_page }">
            <a href="#">{{ i+1 }}</a>
        </li>
        <li :class="{ 'disabled': !hasNext() }">
            <a href="#">&raquo;</a>
        </li>
    </ul>
</template>

<script>
    export default {

        props: ['pagination'],

        methods: {

            hasPrevious: function () {
                return !! this.pagination.links.previous;
            },

            hasNext: function () {
                return !! this.pagination.links.next;
            }

        }

    }
</script>