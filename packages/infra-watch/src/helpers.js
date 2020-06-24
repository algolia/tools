import {getKey} from "common/components/selectors/getClusterList";
import algoliasearch from "algoliasearch";

let appIndex = null;
let failingMachines = [];
let recoveredMachines = [];

async function getIndex() {
    if (appIndex !== null) return appIndex;

    const key = await getKey();
    const client = algoliasearch('X20GSLY1CL', key);
    appIndex = client.initIndex('applications_production');

    return appIndex;
}

function extractSeries(series) {
    return series.map((x) => {
        return x[2][0].split('=')[1];
    }).filter((clusterName) => {
        return isCluster(clusterName) || isDsn(clusterName);
    });
}

export async function getInfras(clusterNames, query) {
    const infras = {};
    const promises = clusterNames.map(async (clusterName, i) => {
        return getInfraFromMachine(infras, clusterName, query)
    });
    await Promise.all(promises);

    return infras;
}


export async function getMlockData() {
    const backendEnpoint = process.env.VUE_APP_METAPARAMS_BACKEND_ENDPOINT || 'https://tools-backend.algolia.com';
    const res = await fetch(`${backendEnpoint}/mlock-alerts/last`, {
        credentials: 'include',
        headers: {
            "Content-Type": "application/json",
        },
    });
    const json = await res.json();

    failingMachines = extractSeries(json.failingSeries);
    recoveredMachines = extractSeries(json.recoveredSeries);

    return {
        failing: await getInfras(failingMachines),
        recovered: await getInfras(recoveredMachines),
    }
}

function isCluster(clusterName) {
    return clusterName.startsWith('v') || clusterName.startsWith('d');
}
function isDsn(clusterName) {
    return clusterName.startsWith('t') || clusterName.startsWith('w');
}

function isShared(clusterName) {
    return clusterName.startsWith('c') || clusterName.startsWith('b') || clusterName.startsWith('places');
}

export async function getInfraFromMachine(infras, clusterName, query) {
    const index = await getIndex();
    const res = await index.search(query || '', {
        filters: `deleted:false AND clusters_and_replicas_names:${clusterName}`,
        hitsPerPage: 20,
        disableTypoToleranceOnAttributes: ['clusters_and_replicas_names'],
        allowTyposOnNumericTokens: false,
        typoTolerance: 'min',
    });

    res.hits.forEach((hit) => {
        const mainCluster = hit.cluster_name;

        if (infras.__keys__ === undefined) infras.__keys__ = [];
        if (!infras.__keys__.includes(mainCluster)) infras.__keys__.push(mainCluster);

        if (infras[mainCluster] === undefined) {
            const allMachines = [];
            const clusters = [];
            const dsns = [];
            const failing = [];

            hit.clusters_and_replicas_names.forEach((m,i) => {
                const hm = hit._highlightResult.clusters_and_replicas_names[i].value;
                if (isCluster(m) || (isShared(m) && i === 0) || hit.clusters_and_replicas_names.length === 1) {
                    allMachines.push(hm);
                    clusters.push(hm);
                }
                if (isDsn(m)) {
                    allMachines.push(hm);
                    dsns.push(hm);
                }
                if (failingMachines.includes(m) && failing.includes(m) === false) {
                    failing.push(hm);
                }
            });

            infras[mainCluster] = {
                allMachines, clusters, dsns,
                failingMachines: failing,
                users: {},
            };
        }

        if (infras[mainCluster].users[hit.user_email] === undefined) {
            infras[mainCluster].users[hit.user_email] = {
                apps: [],
                company: hit.user_company ? hit._highlightResult.user_company.value : '',
                email: hit._highlightResult.user_email.value,
            };
        }

        const foundApp = infras[mainCluster].users[hit.user_email].apps.findIndex((e) => {
            return hit.application_id === e.appId;
        }) !== -1;

        if (!foundApp) {
            infras[mainCluster].users[hit.user_email].apps.push({
                appId: hit._highlightResult.application_id.value,
                appName: hit.name ? hit._highlightResult.name.value : '',
                adminUrl: `https://admin.algolia.com/admin/users/${hit.user_id}/applications/${hit.application_id}`,
            });
        }
    });
}
