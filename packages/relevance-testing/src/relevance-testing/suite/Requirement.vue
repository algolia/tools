<template>
    <div>
        <div v-if="requirementPos > 0">
            <div class="flex">
                <div class="mx-auto border-l border-proton-grey h-12"></div>
            </div>
            <div class="flex">
                <div class="mx-auto bg-moon-grey-opacity-50 border border-proton-grey px-8 py-4 rounded text-xs uppercase tracking-wide text-solstice-blue">
                    AND
                </div>
            </div>
            <div class="flex">
                <div class="mx-auto border-l border-proton-grey h-12"></div>
            </div>
        </div>
        <div class="relative bg-moon-grey-opacity-50 border border-proton-grey-opacity-20 border-l border-proton-grey p-8 rounded">
            <badge
                v-if="passing !== undefined"
                :passing="passing"
                class="absolute"
                style="top: -8px; left: 0; transform: translate(0%, -100%);"
            />
            <div>
                <div class="flex flex-wrap items-center">
                    <custom-select
                        v-model="requirement.type"
                        :options="['attribute', 'position', 'rankingInfo', 'is before', 'is after']"
                        class="mr-8 w-104 text-solstice-blue text-sm border-b border-telluric-blue-opacity-60 pb-4"
                    >
                        <template v-slot:default="{option}">{{option}}</template>
                    </custom-select>
                    <input
                        v-if="requirement.type === 'attribute'"
                        v-model="requirement.key"
                        class="input-custom w-104 shadow-sm mr-8 p-4 w-108"
                    />
                    <custom-select
                        v-if="requirement.type === 'rankingInfo'"
                        v-model="requirement.key"
                        :options="getCriteria()"
                        class="mr-8 w-104 text-solstice-blue text-sm border-b border-telluric-blue-opacity-60 pb-4"
                    >
                        <template v-slot:default="{option}">{{option}}</template>
                    </custom-select>
                </div>
                <div class="flex flex-wrap items-center">
                    <sign-select
                        v-if="requirement.type !== 'is before' && requirement.type !== 'is after'"
                        v-model="requirement.operator"
                        class="mr-8 my-8 w-104"
                    />
                    <input
                        v-if="requirement.type === 'attribute'"
                        v-model="requirement.value"
                        class="input-custom w-104 shadow-sm p-4 w-108"
                    />
                    <input
                        v-if="requirement.type === 'position'"
                        type="number"
                        min="1"
                        v-model.number="position"
                        class="input-custom w-104 shadow-sm p-4 w-108"
                    />
                    <input
                        v-if="requirement.type === 'rankingInfo'"
                        type="number"
                        min="0"
                        v-model.number="requirement.value"
                        class="input-custom w-104 shadow-sm p-4 w-108"
                    />
                </div>
            </div>
            <trash-icon
                style="right: -8px;"
                class="absolute inset-x-full-y-auto w-12 h-12 text-nova-grey-opacity-60 hover:text-telluric-blue cursor-pointer mr-auto"
                @click="$emit('onDelete')"
            />
        </div>
        <div class="ml-160" v-if="requirement.type === 'is before' || requirement.type === 'is after'">
            <requirements
                :requirements="requirement.value"
                :run-index="runIndex"
                :reports="null"
            />
        </div>
    </div>
</template>

<script>
    import SignSelect from "@/relevance-testing/common/SignSelect";
    import Badge from "@/relevance-testing/common/Badge";
    import CustomSelect from "common/components/selectors/CustomSelect";
    import TrashIcon from "common/icons/trash.svg";
    import {getCriteria} from 'common/utils/rankingInfo';
    import Requirements from "@/relevance-testing/suite/Requirements";

    export default {
        name: 'Requirement',
        components: {Requirements, Badge, SignSelect, CustomSelect, TrashIcon},
        props: ['requirement', 'requirementPos', 'passing', 'runIndex'],
        watch: {
            type: function () {
                if (this.type === 'attribute') {
                    this.$set(this.requirement, 'value', this.requirement.value.toString());
                }

                if (this.type === 'rankingInfo' || this.type === 'position') {
                    const parsedValue = parseInt(this.requirement.value);
                    const value = isNaN(parsedValue) ? 0 : parsedValue;
                    this.$set(this.requirement, 'value', value);
                }

                if (this.type === 'is before' || this.type === 'is after') {
                    if (!Array.isArray(this.requirement.value)) {
                        this.$set(this.requirement, 'value', []);
                    }
                }
            }
        },
        data: function () {
            return {
                getCriteria,
            }
        },
        computed: {
            type: function () {
                return this.requirement.type;
            },
            position: {
                get () {
                    return this.requirement.value + 1;
                },
                set (val) {
                    this.$set(this.requirement, 'value', val - 1);
                }
            }
        }
    }
</script>