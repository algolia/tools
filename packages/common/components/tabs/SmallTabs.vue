<template>
    <div class="flex">
        <div class="flex rounded overflow-hidden text-nova-grey">
            <div v-for="tab in tabs"
                class="bg-moon-grey p-4 h-28 px-12 flex items-center self-start cursor-pointer border-b-2 border-transparent"
                :class="tab.value === value ? 'text-nebula-blue border-b-2 border-nebula-blue-opacity-80' : ''"
                @click="$emit('input', tab.value)"
            >
                <component
                    name="TabIcon"
                    v-if="tab.icon"
                    :is="tab.icon"
                    class="w-auto h-8 mr-4"
                />
                <div class="text-sm">{{tab.name}}</div>
            </div>
        </div>
    </div>
</template>

<script>
    export default {
        name: 'SmallTabs',
        props: ['value', 'tabs'],
    }
</script>