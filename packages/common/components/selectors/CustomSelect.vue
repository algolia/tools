<template>
    <div>
        <div
            class="relative focus:outline-none"
            tabindex="-1"
            @keyup="onKeyUp"
            @keydown="onKeyDown"
            @blur="fakeBlur"
        >
            <div
                v-if="!dropdownOpened || !refine"
                @click="openDropDown"
                class="flex items-center py-4 cursor-pointer text-sm leading-none"
            >
                <slot name="icon" />
                <slot v-bind:option="value" v-bind:inDropDown="false" />
                <span class="ml-auto"></span>
                <chevron-down-icon
                    class="block ml-24 w-8 h-8 fill-current"
                />
            </div>
            <input
                v-if="dropdownOpened && refine"
                ref="input"
                class="px-8 py-4 text-solstice-blue rounded text-base bg-moon-grey w-full"
                v-model="query"
                @keyup="onKeyUp"
                @keydown="onKeyDown"
                @blur="onBlur"
            />
            <div
                v-if="dropdownOpened"
                class="shadow absolute z-10 bg-white dropdown mt-4 max-h-312 min-w-full overflow-y-scroll"
            >
                <div
                    v-for="(option, index) in options"
                    :class="`${selectedIndex === index ? 'bg-nebula-blue text-white hover:bg-nebula-blue hover:text-white' : ''}`"
                    class="flex p-8 cursor-pointer"
                    @mousedown="allowBlur = false"
                    @mousemove="selectedIndex = index"
                    @mouseleave="selectedIndex = -1"
                    @click="selectedIndex = index; onSelected($event); allowBlur = true;"
                >
                    <slot
                        v-bind:option="option"
                        v-bind:inDropDown="true"
                        v-bind:isSelected="selectedIndex === index"
                        v-bind:highlightString="highlightString"
                    />
                </div>
            </div>
        </div>
    </div>
</template>

<script>
    import ChevronDownIcon from "common/icons/chevron-down.svg";
    import Vue from 'vue';
    import {highlightStringBaseOnQuery, escapeHtml} from "../../utils/formatters";

    export default {
        name: 'CustomSelect',
        props: ['value', 'options', 'displayEmptyQuery', 'refine', 'stringValueAttribute', 'allowFreeText'],
        components: {ChevronDownIcon},
        data: function () {
            const value = this.stringValueAttribute && this.value ? this.value[this.stringValueAttribute] : this.value;
            return {
                allowBlur: true,
                selectedIndex: -1,
                dropdownOpened: false,
                query: value || '',
            }
        },
        watch: {
            query: function () {
                if (!this.refine) return;

                this.selectedIndex = -1;
                const query = this.query === this.stringValue ? '' : this.query;
                this.refine(query);
            },
            value: function () {
                if (!this.refine) return;

                this.query = this.stringValue;
            }
        },
        computed: {
            stringValue: function () {
                return this.stringValueAttribute && this.value ? this.value[this.stringValueAttribute] : (this.value || '');
            }
        },
        methods: {
            highlightString: function (s) {
                // Not XSS safe, s must be escaped before calling this function.
                return highlightStringBaseOnQuery(s, this.query);
            },
            fakeBlur: function () {
                if (!this.refine) this.onBlur();
            },
            onBlur: function () {
                if (this.allowBlur) {
                    this.dropdownOpened = false;
                    this.selectedIndex = -1;
                }
            },
            onKeyDown: function (e) {
                if (e.which === 13 || e.which === 38 || e.which === 40) e.preventDefault();
            },
            onKeyUp: function (e) {
                if (e.which === 13 || e.which === 38 || e.which === 40) {
                    e.preventDefault();
                    e.stopImmediatePropagation();

                    if (e.which === 13) this.onSelected(e); // enter or tab

                    let index;

                    if (e.which === 38) { // up
                        index = this.selectedIndex - 1;
                        if (index < 0) index = this.options.length - 1;
                        this.selectedIndex = index;
                    }

                    if (e.which === 40) { // down
                        index = this.selectedIndex + 1;
                        if (index > this.options.length - 1) index = 0;
                        this.selectedIndex = index;
                    }
                    return false;
                }
            },
            onSelected: function (e) {
                this.allowBlur = false;
                if (this.selectedIndex !== -1 && this.options.length > 0) {
                    this.$emit('input', this.options[this.selectedIndex]);
                } else {
                    if (this.allowFreeText && this.query.length > 0) {
                        this.$emit('input', {name: this.query});
                    } else {
                        this.$emit('onSelected', this.query, e);
                    }
                }

                this.selectedIndex = this.query.length === 0 && !this.displayEmptyQuery ? -1 : 0;
                this.allowBlur = true;
                this.dropdownOpened = false;
            },
            openDropDown: function () {
                this.dropdownOpened = true;
                this.query = this.stringValue;

                if (this.refine) {
                    Vue.nextTick(() => {
                        this.$refs.input.focus();
                        this.$refs.input.setSelectionRange(0, this.$refs.input.value.length);
                    });
                }
            },
        },
    }
</script>
