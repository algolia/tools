<template>
    <tr v-if="flatValue">
        <td class="w-50 max-w-50 truncate text-light-grey-3 align-top">
            <span v-html="attributeName"></span>
        </td>
        <td class="pl-12 align-top">
            <template v-if="Array.isArray(value)">
                <div>
                    <template v-for="(subvalue, i) in sortedValueSliced">
                        <span v-html="subvalue"></span>
                        <span v-if="i < sortedValueSliced.length - 1">, </span>
                    </template>
                    <span v-if="!expanded && value.length > 4" @click="expanded = true" class="text-light-grey-2 cursor-pointer">
                        and {{value.length - 4}} more
                    </span>
                </div>
            </template>
            <span v-else v-html="value"></span>
        </td>
    </tr>
</template>

<script>
import {get} from "common/utils/objectHelpers";

export default {
    name: 'Attribute',
    props: ['hit', 'attributeName', 'topAttributes'],
    data: function () {
        return {
            expanded: false,
        }
    },
    computed: {
        flatValue: function () {
            return get(this.hit, this.attributeName);
        },
        value: function () {
            if (!this.flatValue) return '';
            if (typeof this.flatValue === 'object' && this.flatValue.constructor === Object && this.flatValue.value !== undefined) {
                return this.flatValue.value;
            }
            if (Array.isArray(this.flatValue)) {
                return this.flatValue.map((v) => {
                    if (typeof v === 'object' && v.constructor === Object && v.value !== undefined) {
                        return v.value;
                    }
                    return v;
                });
            }
            return this.flatValue;
        },
        sortedValueSliced: function () {
            if (Array.isArray(this.value)) {
                const values = this.value.slice();
                return this.expanded ? values : values.slice(0, 4);
            }
            return this.value;
        },
    },
}
</script>
