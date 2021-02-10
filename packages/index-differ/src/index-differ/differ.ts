import { encode } from '@algolia/client-common';
import { serializeQueryParameters } from '@algolia/transporter';
import { SearchIndex } from 'algoliasearch';
import * as Diff from 'diff';
import {IndexData, IndexLoader} from "./IndexLoader";
import index from "../../../common/store/modules/apps";

enum Version {
    A = 'A',
    B = 'B',
}

enum ResourceName {
    RECORDS = 'records',
    SYNONYMS = 'synonyms',
    RULES = 'rules',
    SETTINGS = 'settings',
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

function createDiffObject(a:string, b:string) {
    const linesA = a.length > 0 ? a.split('\n') : [];
    const linesB = b.length > 0 ? b.split('\n') : [];
    return Diff.diffArrays(linesA, linesB);
}

function createPatchFromDiffs(rawDiffs:any) {
    let patch = `Index:\n===================================================================\n--- \t\n+++ \t\n@@ -1,0 +1,0 @@\n`;

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

class Differ {
    indexLoader: IndexLoader;
    refIndexLoader: IndexLoader;

    diffs: {
        records: readonly any[],
        rules: readonly any[],
        synonyms: readonly any[],
        settings: readonly any[],
    };

    stats: {
        records: Stat,
        rules: Stat,
        synonyms: Stat,
        settings: Stat,
    };

    constructor(refIndexLoader: IndexLoader, indexLoader: IndexLoader) {
        this.indexLoader = indexLoader;
        this.refIndexLoader = refIndexLoader;

        this.diffs = {
            records: [],
            rules: [],
            synonyms: [],
            settings: [],
        };

        this.stats = {
            records: getDefaultStat(),
            synonyms: getDefaultStat(),
            rules: getDefaultStat(),
            settings: getDefaultStat(),
        };
    }

    async load () {
        const promises : Promise<void>[] = [
            this.refIndexLoader.load(),
            this.indexLoader.load(),
        ];

        await Promise.all(promises);

        this.postProcess(ResourceName.SETTINGS);
        this.postProcess(ResourceName.SYNONYMS);
        this.postProcess(ResourceName.RULES);
        this.postProcess(ResourceName.RECORDS);
    }
    async loadAllRecords(): Promise<void> {
        const promises : Promise<void>[] = [
            this.refIndexLoader.allRecords(),
            this.indexLoader.allRecords(),
        ];

        await Promise.all(promises);
    }

    postProcess(resourceName:ResourceName): void {
        let added = 0;
        let untouched = 0;
        let removed = 0;
        let modified = 0;

        const diffs: any[] = [];

        const max = Math.max(this.refIndexLoader.indexData.ids[resourceName].length, this.indexLoader.indexData.ids[resourceName].length);
        let aCounter = 0;
        let bCounter = 0;

        while (aCounter < max && bCounter < max) {
            if (this.refIndexLoader.indexData.ids[resourceName][aCounter] === this.indexLoader.indexData.ids[resourceName][bCounter]) {
                const stringA = JSON.stringify(this.refIndexLoader.indexData.objects[resourceName][this.refIndexLoader.indexData.ids[resourceName][aCounter]], null, 2);
                const stringB = JSON.stringify(this.indexLoader.indexData.objects[resourceName][this.indexLoader.indexData.ids[resourceName][bCounter]], null, 2);
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
                    value: this.refIndexLoader.indexData.ids[resourceName][aCounter],
                });

                if (isModified) modified++; else untouched++;

                aCounter++;
                bCounter++;
            } else if (bCounter >= this.indexLoader.indexData.ids[resourceName].length || this.refIndexLoader.indexData.ids[resourceName][aCounter] < this.indexLoader.indexData.ids[resourceName][bCounter]) {
                diffs.push({
                    added: false,
                    removed: true,
                    modified: false,
                    untouched: false,
                    lineNumberA: aCounter + 1,
                    lineNumberB: bCounter + 1,
                    stringA: JSON.stringify(this.refIndexLoader.indexData.objects[resourceName][this.refIndexLoader.indexData.ids[resourceName][aCounter]], null, 2),
                    stringB: '',
                    value: this.refIndexLoader.indexData.ids[resourceName][aCounter],
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
                    stringB: JSON.stringify(this.indexLoader.indexData.objects[resourceName][this.indexLoader.indexData.ids[resourceName][bCounter]], null, 2),
                    value: this.indexLoader.indexData.ids[resourceName][bCounter],
                });
                added++;
                bCounter++;
            }
        }

        this.diffs[resourceName] = Object.freeze(diffs);

        const biggest = Object.keys(this.indexLoader.indexData.objects[resourceName]).length + removed;

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

    get isComplete(): boolean {
        return this.refIndexLoader.indexData.complete && this.indexLoader.indexData.complete;
    }

    async setBrowseObjectsParams(params: any): Promise<any> {
        this.diffs.records = [];
        this.stats.records = getDefaultStat();

        const promises = [
            this.indexLoader.setBrowseParams(params),
            this.refIndexLoader.setBrowseParams(params),
        ];

        await Promise.all(promises);
        this.postProcess(ResourceName.RECORDS);
    }
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

export default Differ;
