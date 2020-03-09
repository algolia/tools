<template>
    <div>
        <div v-if="isArray || isObject">
            <div v-if="isArray">
                <div class="flex relative">
                    <div v-if="canExand" class="absolute left-0 -ml-12 cursor-pointer" @click="collapsed = !collapsed">{{collapsed ? '+' : '-'}}</div>
                    <div v-if="parentKey" class="mr-4">{{parentKey}}:</div>
                    <div v-if="!isCollapsed">[</div>
                    <div v-if="isCollapsed" v-html="highlightedValue" class="whitespace-pre truncate"></div>
                </div>
                <div v-if="!isCollapsed" class="ml-36">
                    <div v-for="(elt, index) in item._v_" class="relative">
                        <div class="absolute left-0 -ml-32 text-proton-grey">[{{index}}]</div>
                        <attribute  :item="elt" />
                    </div>
                </div>
                <div v-if="!isCollapsed">]</div>
            </div>
            <div v-if="isObject">
                <div class="flex relative">
                    <div v-if="canExand" class="absolute left-0 -ml-12 cursor-pointer" @click="collapsed = !collapsed">{{collapsed ? '+' : '-'}}</div>
                    <div v-if="parentKey" class="mr-4">{{parentKey}}:</div>
                    <div v-if="!isCollapsed">{</div>
                    <div v-if="isCollapsed" v-html="highlightedValue" class="whitespace-pre truncate"></div>
                </div>
                <div v-if="!isCollapsed" class="ml-36">
                    <attribute v-for="(value, key) in item._v_" :item="value" :parent-key="key" />
                </div>
                <div v-if="!isCollapsed">}</div>
            </div>
        </div>
        <div v-if="isBoolean || isNumber || isNull">
            <div class="flex">
                <div v-if="parentKey">{{parentKey}}:&nbsp;</div>
                <div v-if="isBoolean" class="json-token boolean">{{stringValue}}</div>
                <div v-if="isNumber" class="json-token number">{{stringValue}}</div>
                <div v-if="isNull" class="json-token null">null</div>
            </div>
        </div>
        <div v-if="isString">
            <div class="flex relative">
                <div v-if="isLong" class="absolute left-0 -ml-12 cursor-pointer" @click="collapsed = !collapsed">{{collapsed ? '+' : '-'}}</div>
                <div v-if="parentKey" class="mr-4">{{parentKey}}:</div>
                <div v-if="collapsed" v-html="highlightedValue" class="whitespace-pre truncate"></div>
                <div v-if="!collapsed" class="json-token string break-words w-full"><span v-html="rawStringValue"></span></div>
            </div>
        </div>
    </div>
</template>

<script>
    import {syntaxHighlight} from 'common/utils/formatters';
    import {isString as isStringFunc} from "../../../utils/types";

    export default {
        name: 'Attribute',
        props: ['item', 'parentKey'],
        data: function () {
            return {
                collapsed: true,
            }
        },
        computed: {
            canExand: function () {
                return this.isLong && !this.isForcedExpanded;
            },
            isForcedExpanded: function () {
                return !this.isString && this.item._b_;
            },
            isCollapsed: function () {
                return this.collapsed && !this.item._b_;
            },
            highlightedValue: function () {
                return syntaxHighlight(this.item._s_ || this.stringValue);
            },
            stringValue: function () {
                return JSON.stringify(this.item._v_);
            },
            rawStringValue: function () {
                return JSON.stringify(this.item._rv_ || this.item._rv_);
            },
            isArray: function () {
               return Array.isArray(this.item._v_);
            },
            isLong: function () {
                return this.isArray || this.isObject || (this.isString && this.stringValue.length > 53);
            },
            isString: function () {
                return isStringFunc(this.item._v_);
            },
            isObject: function() {
                return this.item._v_ && typeof this.item._v_ === 'object' && this.item._v_.constructor === Object;
            },
            isBoolean() {
                return typeof this.item._v_ === "boolean";
            },
            isNumber() {
                return typeof this.item._v_ === "number";
            },
            isNull() {
                return this.item._v_ == null;
            }
        },
    }
</script>
