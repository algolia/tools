<template>
    <div class="bg-white rounded border border-proton-grey-opacity-60 w-344 p-16">
        <div>
            <h3>Load</h3>
            <div class="mt-8">
                Email: <input v-model="userEmail" class="input-custom inline p-8" />
            </div>
        </div>
        <div class="mt-16">
            <h3>Display</h3>
            <div class="mt-8">

            </div>
        </div>
        <div class="mt-16">
            <h3>Graphs</h3>
            <div class="mt-8 flex">
                <label class="mr-8">
                    <input type="radio" v-model="usagePeriod" value="day" /> Day
                </label>
                <label class="mr-8">
                    <input type="radio" v-model="usagePeriod" value="week" /> Week
                </label>
                <label class="mr-8">
                    <input type="radio" v-model="usagePeriod" value="month" /> Month
                </label>
                <label class="mr-8">
                    <input type="radio" v-model="usagePeriod" value="year" /> Year
                </label>
            </div>
            <div class="mt-8 flex">
                <label class="mr-8">
                    <input type="checkbox" v-model="detailsPerIndex" value="" /> Detail per index
                </label>
            </div>
            <div class="mt-8">
                <div v-for="group in availableGroupMetrics">
                    <div>
                        <label>
                            <input
                                type="checkbox"
                                :checked="enabledGroupMetrics.includes(group.name)"
                                @input="toggleGroup($event.target.checked, group)"
                            />
                            {{group.name}}
                        </label>
                    </div>
                    <div class="ml-16" v-for="metric in group.metrics" v-if="enabledGroupMetrics.includes(group.name)">
                        <label>
                            <input
                                type="checkbox"
                                :checked="enabledMetrics.includes(metric)"
                                @input="toggleMetric($event.target.checked, metric)"
                            />
                            {{metric}}
                        </label>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
    import availableGroupMetrics from './data/metrics';

    export default {
        name: 'Config',
        props: ['config'],
        data: function () {
            return {
                availableGroupMetrics,
                enabledGroupMetrics: [],
                enabledMetrics: [],
            }
        },
        computed: {
            userEmail: {
                get () {
                    return this.config.email;
                },
                set (value) {
                    this.$emit('onUpdateUserEmail', value);
                }
            },
            usagePeriod: {
                get () {
                    return this.config.usage.period;
                },
                set (value) {
                    this.$emit('onUpdateUsagePeriod', value);
                },
            },
            detailsPerIndex: {
                get () {
                    return this.config.usage.detailsPerIndex;
                },
                set (value) {
                    this.$emit('onUpdateDetailPerIndex', value);
                }
            },
            enabledGraphs: function () {
                return this.availableGroupMetrics.filter((group) => this.enabledGroupMetrics.includes(group.name)).map((group) => {
                    return {
                        ...group,
                        metrics: group.metrics.filter((metric) => this.enabledMetrics.includes(metric)),
                    }
                });
            }
        },
        methods: {
            toggleGroup: function (checked, group) {
                if (checked) {
                    this.enabledMetrics.push(...group.metrics);
                    this.enabledGroupMetrics.push(group.name);
                } else {
                    group.metrics.forEach((metric) => {
                        this.enabledMetrics.splice(this.enabledMetrics.indexOf(metric), 1);
                    });
                    this.enabledGroupMetrics.splice(this.enabledGroupMetrics.indexOf(group.name), 1)
                }
                this.$emit('onUpdateEnabledGraph', JSON.parse(JSON.stringify(this.enabledGraphs)));
            },
            toggleMetric: function (checked, metric) {
                if (checked) {
                    this.enabledMetrics.push(metric);
                } else {
                    this.enabledMetrics.splice(this.enabledMetrics.indexOf(metric), 1);
                }
                this.$emit('onUpdateEnabledGraph', JSON.parse(JSON.stringify(this.enabledGraphs)));
            }
        }
    }
</script>
