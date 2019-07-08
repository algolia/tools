<template>
    <div class="relative">
        <input
                ref="input"
                class="input input-custom"
                :placeholder="placeholder || ''"
                v-model="query"
                v-autowidth="{comfortZone: 10, maxWidth: '100%'}"
                @input="selectedIndex = -1;"
                @keyup="onKeyUp"
                @focus="focused = true"
                @blur="onBlur"
                @keydown="onKeyDown"
        />
        <div class="shadow mt-4 absolute z-10 bg-white dropdown" v-if="focused && (query.length > 0 || displayEmptyQuery)">
            <div
                v-for="(item, index) in items"
                class="p-8 cursor-pointer border border-transparent"
                :class="`${selectedIndex === index ? 'bg-nebula-blue text-white hover:bg-nebula-blue hover:text-white' : ''}`"
                @click="click($event, index)"
                @mousedown="mouseDown"
                @mousemove="selectedIndex = index"
                @mouseleave="selectedIndex = -1"
            >
                <slot name="item"
                      v-bind:index="index"
                      v-bind:item="item"
                ></slot>
            </div>
        </div>
    </div>
</template>
<script>
    export default {
        name: 'autocomplete',
        props: ['items', 'refine', 'value', 'displayEmptyQuery', 'placeholder'],
        data: function () {
            let query = '';
            if (this.value !== undefined && this.value !== null) query = this.value.toString();

            return {
                query: query,
                selectedIndex: -1,
                allowBlur: true,
                focused: false,
            };
        },
        mounted: function () {
            this.refine(this.currentQuery);
        },
        computed: {
            currentQuery: function () {
                const value = this.value !== undefined && this.value !== null ? this.value.toString() : null;
                return this.query === value ? '' : this.query;
            },
        },
        methods: {
            click: function (e, index) {
                this.selectedIndex = index;
                this.onSelected(e);
                this.allowBlur = true;
                this.focused = false;
                this.$refs.input.blur();
            },
            mouseDown: function (e) {
                e.preventDefault(); // Make sure we don't trigger the blur event for a click on results.
                this.allowBlur = false;
            },
            onBlur: function (e) {
                if (this.allowBlur) this.$emit('onBlur', e);
                this.focused = false;
            },
            onKeyDown: function (e) {
                if (e.which === 9) { // tab
                    e.preventDefault();
                    e.stopImmediatePropagation();
                }
                if (e.which === 38 || e.which === 40) { // up or down
                    e.preventDefault();
                }
            },
            onKeyUp: function (e) {
                if (e.which === 13 || e.which === 9 || e.which === 38 || e.which === 40) {
                    e.preventDefault();
                    e.stopImmediatePropagation();

                    if (e.which === 13 || e.which === 9) { // enter or tab
                        this.onSelected(e);
                    }

                    let index;

                    if (e.which === 38) { // up
                        index = this.selectedIndex - 1;
                        if (index < 0) {
                            index = this.items.length - 1
                        }
                        this.selectedIndex = index;
                    }

                    if (e.which === 40) { // down
                        index = this.selectedIndex + 1;
                        if (index > this.items.length - 1) {
                            index = 0
                        }
                        this.selectedIndex = index;
                    }
                    return false;
                }
            },
            onSelected: function (e) {
                this.allowBlur = false;
                if (this.selectedIndex !== -1 && this.items.length > 0) {
                    this.$emit('onSelected', this.items[this.selectedIndex], e);
                } else {
                    this.$emit('onSelected', this.query, e);
                }

                this.query = '';
                this.selectedIndex = this.query.length === 0 && !this.displayEmptyQuery ? -1 : 0;
            },
        },
        watch: {
            currentQuery: function (newVal) {
                this.refine(newVal);
            },
        },
    }
</script>