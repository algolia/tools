<template>
    <div v-if="tasksGroup">
        <div class="mb-8"><b>{{tasksGroup.name}}</b></div>
        <div v-for="task in tasksGroup.tasks">
            <div>
                {{task.name}}
                <span v-if="task.outOf">{{task.nth}}/{{task.outOf}}</span>
                <span v-if="task.done">
                        <check-icon class="w-12 h-12" />
                    </span>
                <span v-if="task.running">
                        <loader-icon class="w-12 h-12 infinte-rotate" />
                    </span>
            </div>
        </div>
    </div>
</template>

<script>
    import LoaderIcon from "../icons/loader.svg";
    import CheckIcon from "../icons/check.svg";

    export default {
        props: ['tasksGroup'],
        components: {LoaderIcon, CheckIcon}
    }
</script>
