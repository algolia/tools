<template>
    <div>
        <div v-if="i > 0">
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
                        v-model="condition.type"
                        :options="['attribute', 'position', 'rankingInfo', 'is before', 'is after']"
                        class="mr-8 w-104 text-solstice-blue text-sm border-b border-telluric-blue-opacity-60"
                    >
                        <template v-slot:default="{option}">{{option}}</template>
                    </custom-select>
                    <input
                        v-if="condition.type === 'attribute'"
                        v-model="condition.key"
                        class="input-custom w-104 shadow-sm mr-8 p-4 w-108"
                    />
                </div>
                <div class="flex flex-wrap items-center">
                    <sign-select v-model="condition.operator" class="mr-8 my-8 w-104" />
                    <input
                        v-if="condition.type === 'attribute'"
                        v-model="condition.value"
                        class="input-custom w-104 shadow-sm p-4 w-108"
                    />
                    <input
                        v-if="condition.type === 'position'"
                        type="number"
                        min="0"
                        v-model.number="condition.value"
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
    </div>
</template>

<script>
    import SignSelect from "@/relevance-testing/SignSelect";
    import CustomSelect from "common/components/selectors/CustomSelect";
    import TrashIcon from "common/icons/trash.svg";
    import Badge from "@/relevance-testing/Badge";

    export default {
        name: 'Requirement',
        components: {Badge, SignSelect, CustomSelect, TrashIcon},
        props: ['condition', 'i', 'passing'],
    }
</script>