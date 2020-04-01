<template>
    <table>
        <tr v-for="bust in busted">
            <td class="px-12">{{bust.name}}</td>
            <td class="px-12">{{bust.email}}</td>
            <td>
                {{bust.appName}}
            </td>
            <td class="px-12">
                <a
                    :href="bust.adminUrl"
                    class="text-nebula-blue cursor-pointer hover:underline"
                    target="_blank"
                >
                    {{bust.appId}}
                </a>
            </td>
            <td class="px-12">{{bust.cluster}}</td>
        </tr>
    </table>
</template>

<script>
    import {getKey} from "common/components/selectors/getClusterList";
    import algoliasearch from "algoliasearch";

    export default {
        name: 'Busted',
        data: function () {
            return {
                busted: [],
            };
        },
        created: async function () {
            const key = await getKey();
            const client = algoliasearch('X20GSLY1CL', key);
            const index = client.initIndex('applications_production');


            await index.browseObjects({
                batch: (applications) => {
                    applications.forEach((application) => {
                        for (let i = 0; i < application.clusters_and_replicas_names.length; i++) {
                            const cluster = application.clusters_and_replicas_names[i];

                            if (application.deleted !== true && application.user_email.endsWith('@algolia.com')) {
                                if (cluster.startsWith('d') || cluster.startsWith('v')) {
                                    this.busted.push({
                                        name: application.user_full_name,
                                        email: application.user_email,
                                        appId: application.application_id,
                                        appName: application.name,
                                        cluster: cluster,
                                        adminUrl: `https://admin.algolia.com/admin/users/${application.user_id}/applications/${application.application_id}`,
                                    });
                                    this.busted.sort((a, b) => {
                                        if (a.name && b.name && a.name !== b.name) return a.name.localeCompare(b.name);
                                        return a.cluster.localeCompare(b.cluster);
                                    });
                                    break;
                                }
                            }
                        }
                    });
                }
            });
        },
    }
</script>
