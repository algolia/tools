<template>
    <div>
        <ul class="flex mt-24 mb-12 pl-0" v-if="!cursor">
            <li
                v-if="page > 0"
                class="flex items-center mx-4 px-8 py-4 text-nova-grey rounded cursor-pointer bg-moon-grey"
                @click="setPage(page - 1)"
            >
                <chevron-left-icon class="w-12 h-12" />
            </li>
            <template v-if="pages[0] > 0">
                <li class="flex items-center mx-4 px-8 py-4 text-nova-grey rounded cursor-pointer bg-moon-grey" @click="setPage(0)">1</li>
                <li class="flex items-center mx-4 px-8 py-4 text-nova-grey rounded cursor-pointer">...</li>
            </template>
            <li
                v-for="p in pages"
                :class="p === page ? 'border border-telluric-blue-opacity-80' : ''"
                class="flex items-center mx-4 px-8 py-4 text-nova-grey rounded cursor-pointer bg-moon-grey"
                @click="setPage(p)"
            >
                <span>{{p + 1}}</span>
            </li>
            <template v-if="pages[pages.length - 1] < nbPages - 1">
                <li class="flex items-center mx-4 px-8 py-4 text-nova-grey rounded cursor-pointer">...</li>
                <li class="flex items-center mx-4 px-8 py-4 text-nova-grey rounded cursor-pointer bg-moon-grey" @click="setPage(nbPages - 1)">{{nbPages}}</li>
            </template>
            <li
                v-if="page < nbPages - 1"
                class="flex items-center mx-4 px-8 py-4 text-nova-grey rounded cursor-pointer bg-moon-grey"
                @click="setPage(page + 1)">
                <chevron-left-icon class="w-12 h-12 rotate-180" />
            </li>
        </ul>
        <ul class="flex mt-24 mb-12 pl-0" v-if="cursor">
            <li
                class="flex items-center mx-4 px-8 py-4 text-nova-grey rounded cursor-pointer bg-moon-grey"
                @click="$emit('onDeleteParam', 'cursor')"
            >
                First page
            </li>
            <li
                class="flex items-center mx-4 px-8 py-4 text-nova-grey rounded cursor-pointer bg-moon-grey"
                @click="$emit('onSetParamValue', 'cursor', cursor)"
            >
                Next page
            </li>
        </ul>
    </div>
</template>

<script>
    import Paginator from './paginator'
    import ChevronLeftIcon from 'common/icons/chevron-left.svg';

    export default {
        name: 'Pagination',
        props: ['page', 'nbPages', 'cursor'],
        components: {ChevronLeftIcon},
        computed: {
            pages: function () {
                return this.paginator.pages();
            },
            paginator: function () {
                return new Paginator(this.page, this.nbPages);
            },
        },
        methods: {
            setPage: function (page) {
                if (this.page >= 0 && this.page < this.nbPages) {
                    this.$emit('onSetParamValue', 'page', page);
                }
            },
        },
    }
</script>