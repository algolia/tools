import algoliasearch from 'algoliasearch';
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
    indexA: algoliasearch.Index;
    indexB: algoliasearch.Index;

    A: IndexDiff;
    B: IndexDiff;

    diffs: {
        records: any[],
        rules: any[],
        synonyms: any[],
    };

    stats: {
        records: Stat,
        rules: Stat,
        synonyms: Stat,
    };

    constructor(
        indexA: algoliasearch.Index,
        indexB: algoliasearch.Index,
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

    private getSettings(name: Version, index: algoliasearch.Index): Promise<undefined> {
        return new Promise((resolve, reject) => {
            index.getSettings((err, content) => {
                if (err) {
                    reject(err);
                    return;
                }

                this[name].settings = content;
                resolve();
            });
        });
    }

    private async getSynonyms(name: Version, index: algoliasearch.Index): Promise<void> {
        const synonyms: any[] = [];

        // @ts-ignore: exportSynonyms is not in @types/algolia
        await index.exportSynonyms(1000, (fetchedSynonyms: any) => {
            synonyms.push(...fetchedSynonyms);
        });

        this[name].ids.synonyms = synonyms.map((synonym) => synonym.objectID);
        this[name].nbHits.synonyms = synonyms.length;
        this[name].objects.synonyms = synonyms.reduce((obj:any, synonym) => {
            obj[synonym.objectID] = synonym;
            return obj;
        }, {});
    }

    private async getRules(name: Version, index: algoliasearch.Index): Promise<void> {
        const rules: any[] = [];

        // @ts-ignore: exportRules is not in @types/algolia
        await index.exportRules(1000, (fetchedRules: any) => {
            rules.push(...fetchedRules);
        });

        this[name].ids.rules = rules.map((rule) => rule.objectID);
        this[name].nbHits.rules = rules.length;
        this[name].objects.rules = rules.reduce((obj:any, rule) => {
            obj[rule.objectID] = rule;
            return obj;
        }, {});
    }

    private getRecords(name: Version, index: algoliasearch.Index) {
        return new Promise((resolve, reject) => {
            const fn = (err: any, content: any) => {
                if (err) {
                    reject();
                    return;
                }

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
                index.browse('', fn);
            } else {
                index.browseFrom(this[name].cursor as string, fn);
            }
        });
    }

    postProcess(resourceName:ResourceName): void {
        let added = 0;
        let untouched = 0;
        let removed = 0;
        let modified = 0;

        this.diffs[resourceName] = [];

        let lineNumberA = 0;
        let lineNumberB = 0;

        // @ts-ignore
        Diff.diffArrays(this.A.ids[resourceName], this.B.ids[resourceName]).forEach((group: any) => {
            group.value.forEach((value: any) => {
                const rawDiffs = createDiffObject(
                    this.A.objects[resourceName][value] ? JSON.stringify(this.A.objects[resourceName][value], null, 2) : '',
                    this.B.objects[resourceName][value] ? JSON.stringify(this.B.objects[resourceName][value], null, 2) : '',
                );

                const isModified = !group.added && !group.removed && Array.isArray(rawDiffs) && rawDiffs.length > 1;

                if (group.added) { added++ } else { lineNumberA++ }
                if (group.removed) { removed++ } else { lineNumberB++ }
                if (isModified) modified++;
                if (!group.added && !group.removed && !isModified) untouched++;

                this.diffs[resourceName].push({
                    added: group.added,
                    removed: group.removed,
                    modified: isModified,
                    untouched: (!group.added && !group.removed && !isModified),
                    lineNumberA,
                    lineNumberB,
                    value: value,
                    patch: createPatchFromDiffs(rawDiffs),
                })
            });
        });

        const biggest = Object.keys(this.B.objects[resourceName]).length + removed;

        this.stats[resourceName] = {
            added,
            addedPercentage: Math.round((added / biggest) * 100),
            untouched,
            untouchedPercentage: Math.round((untouched / biggest) * 100),
            removed,
            removedPercentage: Math.round((removed / biggest) * 100),
            modified,
            modifiedPercentage: Math.round((modified / biggest) * 100),
        };
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