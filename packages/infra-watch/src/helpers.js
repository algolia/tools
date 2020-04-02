import {getKey} from "common/components/selectors/getClusterList";
import algoliasearch from "algoliasearch";


export async function getMlockData() {
    const backendEnpoint = process.env.VUE_APP_METAPARAMS_BACKEND_ENDPOINT || 'https://tools-backend.algolia.com';
    const res = await fetch(`${backendEnpoint}/mlock-alerts/last`, {
        credentials: 'include',
        headers: {
            "Content-Type": "application/json",
        },
    });
    const json = await res.json();

    const key = await getKey();
    const client = algoliasearch('X20GSLY1CL', key);
    const index = client.initIndex('applications_production');

    return {
        failing: await extractSeries(json.failingSeries, index),
        recovered: await extractSeries(json.recoveredSeries, index),
    }
}

function isCluster(clusterName) {
    return clusterName.startsWith('v') || clusterName.startsWith('d');
}
function isDsn(clusterName) {
    return clusterName.startsWith('t');
}

export async function getInfraFromMachine(infras, clusterName) {
    const res = await index.search('', {
        'filters': `clusters_and_replicas_names:${clusterName}`,
        'hitsPerPage': 50,
    });

    res.hits.forEach((hit) => {
        const mainCluster = hit.cluster_name;

        if (infras[mainCluster] === undefined) {
            infras[mainCluster] = {
                allMachines: hit.clusters_and_replicas_names,
                clusters: hit.clusters_and_replicas_names.filter((m) => isCluster(m)),
                dsns: hit.clusters_and_replicas_names.filter((m) => isDsn(m)),
                failingMachines: [],
                users: {},
            };
        }

        if (infras[mainCluster].failingMachines.includes(clusterName) === false) {
            infras[mainCluster].failingMachines.push(clusterName);
        }

        if (infras[mainCluster].users[hit.user_email] === undefined) {
            infras[mainCluster].users[hit.user_email] = {
                apps: [],
                company: hit.user_company,
                email: hit.user_email,
            };
        }

        const foundApp = infras[mainCluster].users[hit.user_email].apps.findIndex((e) => {
            return hit.application_id === e.appId;
        }) !== -1;

        if (!foundApp) {
            infras[mainCluster].users[hit.user_email].apps.push({
                appId: hit.application_id,
                appName: hit.name || '',
                adminUrl: `https://admin.algolia.com/admin/users/${hit.user_id}/applications/${hit.application_id}`,
            });
        }
    });
}

async function extractSeries(series, index) {
    const clusters = series.map((x) => {
        return x[2][0].split('=')[1];
    }).filter((clusterName) => {
        return isCluster(clusterName) || isDsn(clusterName);
    });

    const infras = {};
    const promises = clusters.map(async (clusterName) => {
        return getInfraFromMachine(infras, clusterName)
    });
    await Promise.all(promises);

    return infras
}
