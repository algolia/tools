<template>
    <div>
        <div
            v-for="(objectID, index) in forcedTracked"
        >
            <tracked-element
                :value="objectID"
                :left-positions="leftPositions"
                :right-positions="rightPositions"
                :is-last-element="false"
                :index="index"
                :editable="false"
                v-on="$listeners"
                @addTrackedObjectID="addTrackedObjectID"
                @removeTrackedObjectID="removeTrackedObjectID"
            />
        </div>
        <div
            v-for="(objectID, index) in trackedIds"
        >
            <tracked-element
                v-model="trackedIds[index]"
                :left-positions="leftPositions"
                :right-positions="rightPositions"
                :is-last-element="index === trackedIds.length - 1"
                :index="index + (forcedTracked || []).length"
                :index-of-tracked="index"
                :editable="true"
                v-on="$listeners"
                @addTrackedObjectID="addTrackedObjectID"
                @removeTrackedObjectID="removeTrackedObjectID"
            />
        </div>
    </div>
</template>

<script>
    import TrackedElement from "./TrackedElement";

    export default {
        name: 'TrackedElements',
        components: {TrackedElement},
        props: ['value', 'leftPositions', 'rightPositions', 'forcedTracked'],
        data: function () {
            return {
                trackedIds: this.value,
            }
        },
        watch: {
            trackedIds: {
                deep: true,
                handler: function () {
                    this.$emit('input', JSON.parse(JSON.stringify(this.trackedIds)));
                }
            }
        },
        computed: {
            allTracked: function () {
                return [...(this.forcedTracked || []), this.trackedIds];
            }
        },
        methods: {
            addTrackedObjectID: function () {
                if (this.trackedIds[this.trackedIds.length - 1].length > 0) {
                    this.trackedIds.push('');
                }
            },
            removeTrackedObjectID: function (index) {
                this.trackedIds.splice(index, 1);
            },
        }
    }
</script>
