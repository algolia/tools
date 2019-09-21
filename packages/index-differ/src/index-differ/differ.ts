import algoliasearch from 'algoliasearch';
import * as Diff from 'diff';

enum Version {
    A = 'A',
    B = 'B',
}
export interface Record {
    objectID: string;
}
export interface Entry {
    record: Record;
    exists: Entry | false;
    diff: boolean;
}

export interface IndexDiff {
    settings: object;
    objectIDs: string[],
    records: any,
    nbHits: any;
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
};

class DiffGenerator {
    indexA: algoliasearch.Index;
    indexB: algoliasearch.Index;

    A: IndexDiff;
    B: IndexDiff;

    recordsDiff: any[];

    stats: {
        added: number;
        addedPercentage: number;
        untouched: number;
        untouchedPercentage: number;
        removed: number;
        removedPercentage: number;
        modified: number;
        modifiedPercentage: number;
    };

    constructor(
        indexA: algoliasearch.Index,
        indexB: algoliasearch.Index,
    ) {
        this.indexA = indexA;
        this.indexB = indexB;

        this.A = getDefaultDiff();
        this.B = getDefaultDiff();

        this.recordsDiff = [];

        this.stats = {
            added: 0,
            addedPercentage: 0,
            untouched: 0,
            untouchedPercentage: 0,
            removed: 0,
            removedPercentage: 0,
            modified: 0,
            modifiedPercentage: 0,
        };
        this.settings();
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
            toCompute.push(this.getBrowse(Version.A, this.indexA));
        }
        if (!this.B.complete) {
            toCompute.push(this.getBrowse(Version.B, this.indexB));
        }

        await Promise.all(toCompute);
        await this.postProcessBrowse();
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

    private getBrowse(name: Version, index: algoliasearch.Index) {
        return new Promise((resolve, reject) => {
            const fn = (err: any, content: any) => {
                if (err) {
                    reject();
                    return;
                }

                content.hits.forEach((hit: any) => {
                    this[name].records[hit.objectID] = hit;
                });

                this[name].nbHits = content.nbHits;

                const objectIDs = content.hits.map((record: any): string => {
                    return record.objectID;
                });
                this[name].objectIDs.push(...objectIDs);

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

    postProcessBrowse(): void {
        let added = 0;
        let untouched = 0;
        let removed = 0;
        let modified = 0;

        this.recordsDiff = [];

        let lineNumberA = 0;
        let lineNumberB = 0;

        // @ts-ignore
        Diff.diffArrays(this.A.objectIDs, this.B.objectIDs).forEach((group: any) => {
            group.value.forEach((value: any) => {
                const rawDiffs = createDiffObject(
                    this.A.records[value] ? JSON.stringify(this.A.records[value], null, 2) : '',
                    this.B.records[value] ? JSON.stringify(this.B.records[value], null, 2) : '',
                );

                const isModified = !group.added && !group.removed && Array.isArray(rawDiffs) && rawDiffs.length > 1;

                if (group.added) { added++ } else { lineNumberA++ }
                if (group.removed) { removed++ } else { lineNumberB++ }
                if (isModified) modified++;
                if (!group.added && !group.removed && !isModified) untouched++;

                this.recordsDiff.push({
                    added: group.added,
                    removed: group.removed,
                    modified: isModified,
                    lineNumberA,
                    lineNumberB,
                    value: value,
                    patch: createPatchFromDiffs(rawDiffs),
                })
            });
        });

        const biggest = Object.keys(this.B.records).length + removed;

        this.stats = {
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
        objectIDs: [],
        records: {},
        nbHits: 0,
        complete: false,
        cursor: null,
    };
}

export default DiffGenerator;