<template>
    <div class="dropdown btn-group">
        <button type="button" class="btn btn-default dropdown-toggle"
                data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
            {{ sortKeyText }} <span class="caret"></span>
        </button>
        <ul class="dropdown-menu">
            <li v-for="key in sortKeys"><a href="#" @click.prevent="setSortKey(key)">{{ key.text }}</a></li>
        </ul>
    </div>
    <button class="btn btn-link" type="button" @click.prevent="toggleSortDir">
        <span class="fa fa-sort-alpha-{{ sortDirText }}"></span>
    </button>
</template>

<script>
    export default {
        props: ['sort-key', 'sort-keys', 'sort-dir'],
        computed: {
            sortKeyText: function () {
                return this.sortKeys.filter(function (sortKey) {
                    return sortKey.value == this.sortKey;
                }.bind(this))[0].text;
            },
            sortDirText: function () {
                return this.sortDir > 0 ? 'asc' : 'desc';
            }
        },
        methods: {
            setSortKey: function (key) {
                this.$set('sortKey', key.value);
            },
            toggleSortDir: function () {
                this.sortDir = this.sortDir * -1;
            }
        }
    }
</script>
