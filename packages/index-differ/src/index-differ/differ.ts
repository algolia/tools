import { encode } from '@algolia/client-common';
import { serializeQueryParameters } from '@algolia/transporter';
import { SearchIndex } from 'algoliasearch';
import * as Diff from 'diff';

enum Version {
    A = 'A',
    B = 'B',
}

enum ResourceName {
    RECORDS = 'records',
    SYNONYMS = 'synonyms',
    RULES = 'rules',
}

interface Stat {
    added: number;
    addedPercentage: number;
    untouched: number;
    untouchedPercentage: number;
    removed: number;
    removedPercentage: number;
    modified: number;
    modifiedPercentage: number;
}

export interface IndexDiff {
    settings: object;
    ids: {
        records: string[],
        synonyms: string[],
        rules: string[],
    }
    objects: {
        records: any,
        synonyms: any,
        rules: any,
    },
    nbHits: {
        records: number,
        synonyms: number,
        rules: number,
    };
    complete: boolean;
    cursor: string | null;
}

function createDiffObject(a:string, b:string) {
    const linesA = a.length > 0 ? a.split('\n') : [];
    const linesB = b.length > 0 ? b.split('\n') : [];
    return Diff.diffArrays(linesA, linesB);
}

function createPatchFromDiffs(rawDiffs:any) {
    let patch = `Index:\n===================================================================\n--- \t\n+++ \t\n@@ -1,0 +1,0 @@`;

    // @ts-ignore:
    rawDiffs.forEach((rawDiff:any) => {
        rawDiff.value.forEach((value:any) => {
            if (rawDiff.added) {
                patch += '+ ';
            } else if (rawDiff.removed) {
                patch += '- ';
            } else {
                patch += '  ';
            }
            patch += `${value}\n`;
        });
    });

    return patch;
}

export function createPatch(a:string, b:string) {
    const rawDiffs = createDiffObject(a, b);
    return createPatchFromDiffs(rawDiffs);
}

class DiffGenerator {
    indexA: SearchIndex;
    indexB: SearchIndex;

    A: IndexDiff;
    B: IndexDiff;

    diffs: {
        records: readonly any[],
        rules: readonly any[],
        synonyms: readonly any[],
    };

    browseObjectsParams: any;

    stats: {
        records: Stat,
        rules: Stat,
        synonyms: Stat,
    };

    constructor(
        indexA: SearchIndex,
        indexB: SearchIndex,
    ) {
        this.indexA = indexA;
        this.indexB = indexB;

        this.A = getDefaultDiff();
        this.B = getDefaultDiff();

        this.diffs = {
            records: [],
            rules: [],
            synonyms: [],
        };

        this.browseObjectsParams = {};

        this.stats = {
            records: getDefaultStat(),
            synonyms: getDefaultStat(),
            rules: getDefaultStat(),
        };

        this.settings();
        this.records();
        this.synonyms();
        this.rules();
    }

    setBrowseObjectsParams(params: any): void {
        this.browseObjectsParams = params;
        this.A.ids.records = [];
        this.A.objects.records = {};
        this.A.nbHits.records = 0;
        this.A.cursor = null;
        this.B.ids.records = [];
        this.B.objects.records = {};
        this.B.nbHits.records = 0;
        this.B.cursor = null;
        this.diffs.records = [];
        this.stats.records = getDefaultStat();
        this.records();
    }

    get isComplete(): boolean {
        return this.A.complete && this.B.complete;
    }

    async settings(): Promise<void> {
        await Promise.all([
            this.getSettings(Version.A, this.indexA),
            this.getSettings(Version.B, this.indexB),
        ]);
    }

    async records(): Promise<void> {
        const toCompute = [];
        if (!this.A.complete) {
            toCompute.push(this.getRecords(Version.A, this.indexA));
        }
        if (!this.B.complete) {
            toCompute.push(this.getRecords(Version.B, this.indexB));
        }

        await Promise.all(toCompute);
        this.postProcess(ResourceName.RECORDS);
    }

    async allRecords(): Promise<void> {
        let toCompute;
        while (!this.A.complete || !this.B.complete) {
            toCompute = [];
            if (!this.A.complete) {
                toCompute.push(this.getRecords(Version.A, this.indexA));
            }
            if (!this.B.complete) {
                toCompute.push(this.getRecords(Version.B, this.indexB));
            }

            await Promise.all(toCompute);
        }
        this.postProcess(ResourceName.RECORDS);
    }


    async synonyms(): Promise<void> {
        await Promise.all([
            this.getSynonyms(Version.A, this.indexA),
            this.getSynonyms(Version.B, this.indexB),
        ]);
        this.postProcess(ResourceName.SYNONYMS);
    }

    async rules(): Promise<void> {
        await Promise.all([
            this.getRules(Version.A, this.indexA),
            this.getRules(Version.B, this.indexB),
        ]);
        this.postProcess(ResourceName.RULES);
    }

    private getSettings(name: Version, index: SearchIndex): Promise<undefined> {
        return new Promise(async (resolve, reject) => {
            this[name].settings = await index.getSettings();
            resolve();
        });
    }

    private async getSynonyms(name: Version, index: SearchIndex): Promise<void> {
        const synonyms: any[] = [];

        await index.browseSynonyms({
            hitsPerPage: 1000,
            batch: (fetchedSynonyms: any) => {
                synonyms.push(...fetchedSynonyms);
            }
        });

        synonyms.sort((a, b) => a.objectID.localeCompare(b.objectID));

        this[name].ids.synonyms = synonyms.map((synonym) => synonym.objectID);
        this[name].nbHits.synonyms = synonyms.length;
        this[name].objects.synonyms = synonyms.reduce((obj:any, synonym) => {
            obj[synonym.objectID] = synonym;
            return obj;
        }, {});
    }

    private async getRules(name: Version, index: SearchIndex): Promise<void> {
        const rules: any[] = [];

        await index.browseRules({
            hitsPerPage: 1000,
            batch: (fetchedRules: any) => {
                rules.push(...fetchedRules);
            }
        });

        rules.sort((a, b) => a.objectID.localeCompare(b.objectID));

        this[name].ids.rules = rules.map((rule) => rule.objectID);
        this[name].nbHits.rules = rules.length;
        this[name].objects.rules = rules.reduce((obj:any, rule) => {
            obj[rule.objectID] = rule;
            return obj;
        }, {});
    }

    private getRecords(name: Version, index: SearchIndex) {
        return new Promise((resolve, reject) => {
            const fn = (content: any) => {
                content.hits.forEach((hit: any) => {
                    this[name].objects.records[hit.objectID] = hit;
                });

                this[name].nbHits[ResourceName.RECORDS] = content.nbHits;

                const recordsIds = content.hits.map((record: any): string => {
                    return record.objectID;
                });
                this[name].ids.records.push(...recordsIds);
                this[name].ids.records.sort((a: string, b: string) => {
                    return a.localeCompare(b);
                });

                if (content.cursor === undefined) {
                    this[name].complete = true;
                } else {
                    this[name].cursor = content.cursor;
                }
                resolve();
            };

            if (!this[name].cursor) {
                index.transporter.read({
                    method: 'POST',
                    path: encode('/1/indexes/%s/browse', index.indexName),
                    data: {
                        params: serializeQueryParameters(this.browseObjectsParams),
                    },
                }).then(fn);
            } else {
                index.transporter.read({
                    method: 'POST',
                    path: encode('/1/indexes/%s/browse', index.indexName),
                    data: {
                        params: serializeQueryParameters(this.browseObjectsParams),
                        cursor: this[name].cursor,
                    },
                }).then(fn);
            }
        });
    }

    postProcess(resourceName:ResourceName): void {
        let added = 0;
        let untouched = 0;
        let removed = 0;
        let modified = 0;

        const diffs: any[] = [];

        const max = Math.max(this.A.ids[resourceName].length, this.B.ids[resourceName].length);
        let aCounter = 0;
        let bCounter = 0;

        while (aCounter < max && bCounter < max) {
            if (this.A.ids[resourceName][aCounter] === this.B.ids[resourceName][bCounter]) {
                const stringA = JSON.stringify(this.A.objects[resourceName][this.A.ids[resourceName][aCounter]], null, 2);
                const stringB = JSON.stringify(this.B.objects[resourceName][this.B.ids[resourceName][bCounter]], null, 2);
                const isModified = stringA !== stringB;

                diffs.push({
                    added: false,
                    removed: false,
                    modified: isModified    ,
                    untouched: !isModified,
                    lineNumberA: aCounter + 1,
                    lineNumberB: bCounter + 1,
                    stringA,
                    stringB,
                    value: this.A.ids[resourceName][aCounter],
                });

                if (isModified) modified++; else untouched++;

                aCounter++;
                bCounter++;
            } else if (bCounter >= this.B.ids[resourceName].length || this.A.ids[resourceName][aCounter] < this.B.ids[resourceName][bCounter]) {
                diffs.push({
                    added: false,
                    removed: true,
                    modified: false,
                    untouched: false,
                    lineNumberA: aCounter + 1,
                    lineNumberB: bCounter + 1,
                    stringA: JSON.stringify(this.A.objects[resourceName][this.A.ids[resourceName][aCounter]], null, 2),
                    stringB: '',
                    value: this.A.ids[resourceName][aCounter],
                });
                removed++;
                aCounter++;
            } else {
                diffs.push({
                    added: true,
                    removed: false,
                    modified: false,
                    untouched: false,
                    lineNumberA: aCounter + 1,
                    lineNumberB: bCounter + 1,
                    stringA: '',
                    stringB: JSON.stringify(this.B.objects[resourceName][this.B.ids[resourceName][bCounter]], null, 2),
                    value: this.B.ids[resourceName][bCounter],
                });
                added++;
                bCounter++;
            }
        }

        this.diffs[resourceName] = Object.freeze(diffs);

        const biggest = Object.keys(this.B.objects[resourceName]).length + removed;

        this.stats[resourceName] = Object.freeze({
            added,
            addedPercentage: biggest > 0 ? Number((added / biggest * 100).toFixed(2)): 0,
            untouched,
            untouchedPercentage: biggest > 0 ? Number((untouched / biggest * 100).toFixed(2)): 0,
            removed,
            removedPercentage: biggest > 0 ? Number((removed / biggest * 100).toFixed(2)): 0,
            modified,
            modifiedPercentage: biggest > 0 ? Number((modified / biggest * 100).toFixed(2)): 0,
        });
    }
}

function getDefaultDiff(): IndexDiff {
    return {
        settings: {},
        ids: {
            records: [],
            synonyms: [],
            rules: [],
        },
        objects: {
            records: {},
            synonyms: {},
            rules: {},
        },
        nbHits: {
            records: 0,
            synonyms: 0,
            rules: 0,
        },
        complete: false,
        cursor: null,
    };
}

function getDefaultStat() {
    return {
        added: 0,
        addedPercentage: 0,
        untouched: 0,
        untouchedPercentage: 0,
        removed: 0,
        removedPercentage: 0,
        modified: 0,
        modifiedPercentage: 0,
    };
}

export default DiffGenerator;
