<template>
    <custom-select
        v-if="isMcm"
        :value="value"
        @input="$emit('input', $event.userID)"
        :refine="refine"
        :options="users"
        class="min-w-140 text-solstice-blue text-sm border-b border-telluric-blue-opacity-60 pb-4"
    >
        <template slot="icon"><user-icon class="block -mt-1 mr-8 w-12 h-12"/></template>
        <template v-slot:default="{option, inDropDown, isSelected, highlightString}">
            <div>
                <!-- XSS Check: all html entities are escaped using `escapeHtml` -->
                <div v-html="inDropDown ? highlightString(escapeHtml(userLabel(option.userID))) : escapeHtml(userLabel(option))"></div>
                <div
                    v-if="inDropDown"
                    :class="isSelected ? 'text-white': 'text-solstice-blue-opacity-50'"
                >
                    <span v-if="option.nbRecords">({{option.nbRecords}} records) - </span>
                    <span v-if="option.clusterName">{{option.clusterName}}</span>
                </div>
            </div>
        </template>
    </custom-select>
</template>

<script>
    import UserIcon from "common/icons/user.svg";
    import CustomSelect from "common/components/selectors/CustomSelect";
    import {getClient} from "../../utils/algoliaHelpers";
    import {escapeHtml} from "../../utils/formatters";

    export default {
        name: 'UserSelector',
        components: {UserIcon, CustomSelect},
        props: ['appId', 'value'],
        data: function () {
            return {
                users: [],
                isMcm: false,
            };
        },
        created: function () {
            this.loadUsers();
        },
        watch: {
            appId: function () {
                this.isMcm = false;
                this.loadUsers();
            },
        },
        computed: {
            adminAPIKey: function () {
                if (!this.$store.state.apps[this.appId]) return null;
                return this.$store.state.apps[this.appId].key;
            },
        },
        methods: {
            loadUsers: async function () {
                try {
                    await this.refine('');
                    this.isMcm = true;
                    this.$emit('input', '*');
                } catch (e) {
                    this.isMcm = false;
                    this.users = [];
                    this.$emit('input', null);
                }
            },
            refine: async function (query) {
                const client = await getClient(this.appId, this.adminAPIKey);

                const res = await client.transporter.read({
                    method: 'POST',
                    path: '1/clusters/mapping/search',
                    data: {
                        query: query,
                        hitsPerPage: 40,
                    },
                });

                if (query.length <= 0) {
                    res.hits.unshift({userID: '*'}, {userID: '.'});
                } else {
                    res.hits.push({userID: '*'}, {userID: '.'});
                }

                this.users = res.hits;
            },
            userLabel: function (userId) {
                if (userId === '*') return '* (shared objects)';
                if (userId === '.') return '. (all objects in machine)';
                return userId;
            },
            escapeHtml,
        },
    }
</script>
