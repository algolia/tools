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
    browse: any[];
    index: any;
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
        addedPct: number;
        untouched: number;
        untouchedPct: number;
        deleted: number;
        deletedPct: number;
        modified: number;
        modifiedPct: number;
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
            addedPct: 0,
            untouched: 0,
            untouchedPct: 0,
            deleted: 0,
            deletedPct: 0,
            modified: 0,
            modifiedPct: 0,
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
                const modified: Entry[] = content.hits.map(
                    (record: any): Entry => {
                        return {
                            record,
                            exists: false,
                            diff: false,
                        };
                    }
                );

                const browse: Entry[] = [...this[name].browse, ...modified]/*.sort(
                    (a: any, b: any) => {
                        return a.objectID > b.objectID ? 1 : -1;
                    }
                );*/

                const objectIDs = content.hits.map((record: any): string => {
                    return record.objectID;
                });
                this[name].objectIDs.push(...objectIDs);

                if (content.cursor === undefined) {
                    this[name].complete = true;
                } else {
                    this[name].cursor = content.cursor;
                }
                this[name].browse = browse;
                resolve();
            };

            if (!this[name].cursor) {
                index.browse('', {hitsPerPage: 8}, fn);
            } else {
                index.browseFrom(this[name].cursor as string, fn);
            }
        });
    }

    postProcessBrowse(): void {
        const ABrowse = this.A.browse;
        const BBrowse = this.B.browse;
        let added = 0;
        let untouched = 0;
        let deleted = 0;
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

                if (!group.added) lineNumberA++;
                if (!group.removed) lineNumberB++;

                this.recordsDiff.push({
                    added: group.added,
                    removed: group.removed,
                    modified: !group.added && !group.removed && Array.isArray(rawDiffs) && rawDiffs.length > 1,
                    lineNumberA,
                    lineNumberB,
                    value: value,
                    patch: createPatchFromDiffs(rawDiffs),
                })
            });
        });

        console.log(this.recordsDiff);

        ABrowse.forEach((entry: Entry) => {
            if (entry.exists) {
                return;
            }

            const inB = this.B.browse.find(
                entryB => entryB.record.objectID === entry.record.objectID
            );

            if (!inB) {
                deleted += 1;
                entry.exists = false;
                entry.diff = false;
            } else {
                entry.exists = inB;
            }
        });

        BBrowse.forEach((entry: Entry) => {
            if (entry.exists) {
                if (entry.diff) modified += 1;
                else untouched += 1;
                return;
            }

            const inA = this.A.browse.find(
                entryA => entryA.record.objectID === entry.record.objectID
            );

            if (!inA) {
                added += 1;
            } else {
                entry.exists = inA;
                const diff = Diff.diffJson(inA.record, entry.record);
                if (Array.isArray(diff) && diff.length > 1) {
                    entry.diff = true;
                    modified += 1;
                } else {
                    entry.diff = false;
                    untouched += 1;
                }
            }
        });

        const biggest = this.B.browse.length + deleted;

        this.stats = {
            ...this.stats,
            added,
            addedPct: Math.round((added / biggest) * 100),
            untouched,
            untouchedPct: Math.round((untouched / biggest) * 100),
            deleted,
            deletedPct: Math.round((deleted / biggest) * 100),
            modified,
            modifiedPct: Math.round((modified / biggest) * 100),
        };
    }
}

function getDefaultDiff(): IndexDiff {
    return {
        settings: {},
        browse: [],
        objectIDs: [],
        records: {},
        index: { entries: 0 },
        complete: false,
        cursor: null,
    };
}

export default DiffGenerator;