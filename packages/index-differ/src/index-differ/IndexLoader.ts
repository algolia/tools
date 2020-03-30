import { SearchIndex } from 'algoliasearch';
import {encode} from "@algolia/client-common";
import {serializeQueryParameters} from "@algolia/transporter";
import sleep from "../../../common/utils/time";

export interface IndexData {
    settings: object;
    ids: {
        records: string[],
        synonyms: string[],
        rules: string[],
        settings: string[],
    }
    objects: {
        records: any,
        synonyms: any,
        rules: any,
        settings: any,
    },
    nbHits: {
        records: number,
        synonyms: number,
        rules: number,
        settings: any,
    };
    complete: boolean;
    cursor: string | null;
}

export class IndexLoader {
    indexData: IndexData;
    index: SearchIndex;
    browseParams: any;
    isLoading: boolean;
    isLoaded: boolean;

    constructor(index: SearchIndex) {
        this.index = index;
        this.browseParams = {};
        this.isLoading = false;
        this.isLoaded = false;

        this.indexData = {
            settings: {},
            ids: {
                records: [],
                synonyms: [],
                rules: [],
                settings: [],
            },
            objects: {
                records: {},
                synonyms: {},
                rules: {},
                settings: {},
            },
            nbHits: {
                records: 0,
                synonyms: 0,
                rules: 0,
                settings: 0,
            },
            complete: false,
            cursor: null,
        };
    }

    public async load(): Promise<any> {
        if (this.isLoaded) return;
        if (this.isLoading) {
            while (this.isLoading) {
                await sleep(10);
            }
            return;
        }

        this.isLoading = true;
        const promises = [
            this.loadSettings(),
            this.loadSynonyms(),
            this.loadRules(),
            this.loadRecords(true),
        ];

        await Promise.all(promises);
        this.isLoading = false;
        this.isLoaded = true;
    }

    public async setBrowseParams (params: any) {
        this.browseParams = params;
        await this.loadRecords(true);
    }

    public async loadSettings(): Promise<void> {
        const settings = await this.index.getSettings();
        const keys = Object.keys(settings);
        keys.sort((a: string, b: string) => {
            return a.localeCompare(b);
        });

        this.indexData.ids.settings = keys;
        this.indexData.nbHits.settings = keys.length;
        this.indexData.objects.settings = keys.reduce((obj:any, key:string) => {
            // @ts-ignore:
            obj[key] = settings[key];
            return obj;
        }, {});
    }

    public async loadSynonyms(): Promise<void> {
        const synonyms: any[] = [];

        await this.index.browseSynonyms({
            hitsPerPage: 1000,
            batch: (fetchedSynonyms: any) => {
                synonyms.push(...fetchedSynonyms);
            }
        });

        synonyms.sort((a, b) => a.objectID.localeCompare(b.objectID));

        this.indexData.ids.synonyms = synonyms.map((synonym) => synonym.objectID);
        this.indexData.nbHits.synonyms = synonyms.length;
        this.indexData.objects.synonyms = synonyms.reduce((obj:any, synonym) => {
            obj[synonym.objectID] = synonym;
            return obj;
        }, {});
    }

    public async loadRules(): Promise<void> {
        const rules: any[] = [];

        await this.index.browseRules({
            hitsPerPage: 1000,
            batch: (fetchedRules: any) => {
                rules.push(...fetchedRules);
            }
        });

        rules.sort((a, b) => a.objectID.localeCompare(b.objectID));

        this.indexData.ids.rules = rules.map((rule) => rule.objectID);
        this.indexData.nbHits.rules = rules.length;
        this.indexData.objects.rules = rules.reduce((obj:any, rule) => {
            obj[rule.objectID] = rule;
            return obj;
        }, {});
    }

    public loadRecords(reset: boolean): Promise<void> {
        return new Promise((resolve, reject) => {
            const fn = (content: any) => {
                if (reset) {
                    this.indexData.ids.records = [];
                    this.indexData.objects.records = {};
                    this.indexData.nbHits.records = 0;
                }
                content.hits.forEach((hit: any) => {
                    this.indexData.objects.records[hit.objectID] = hit;
                });

                this.indexData.nbHits.records = content.nbHits;

                const recordsIds = content.hits.map((record: any): string => {
                    return record.objectID;
                });
                this.indexData.ids.records.push(...recordsIds);
                this.indexData.ids.records.sort((a: string, b: string) => {
                    return a.localeCompare(b);
                });

                if (content.cursor === undefined) {
                    this.indexData.complete = true;
                } else {
                    this.indexData.cursor = content.cursor;
                }
                resolve();
            };

            if (reset) {
                this.indexData.cursor = null;
                this.index.transporter.read({
                    method: 'POST',
                    path: encode('/1/indexes/%s/browse', this.index.indexName),
                    data: {
                        params: serializeQueryParameters({attributesToRetrieve: ['*'], ...this.browseParams}),
                    },
                }).then(fn);
            } else {
                this.index.transporter.read({
                    method: 'POST',
                    path: encode('/1/indexes/%s/browse', this.index.indexName),
                    data: {
                        params: serializeQueryParameters({attributesToRetrieve: ['*'], ...this.browseParams}),
                        cursor: this.indexData.cursor,
                    },
                }).then(fn);
            }
        });
    }

    async allRecords(): Promise<void> {
        if (this.isLoading) {
            while (this.isLoading) {
                await sleep(10);
            }
            return;
        }
        this.isLoading = true;

        let toCompute;
        while (!this.indexData.complete) {
            toCompute = [];
            if (!this.indexData.complete) {
                toCompute.push(this.loadRecords(false));
            }

            await Promise.all(toCompute);
        }

        this.isLoading = false;
    }

}
