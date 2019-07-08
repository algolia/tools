<template>
    <div>
        <div @click="editTitleAttribute = true" class="group break-words" style="calc(100%-45px)">
            {{title}}
            <edit-icon class="cursor-pointer ml-4 w-12 h-12 text-nova-grey invisible group-hover:visible"  />
        </div>
        <div v-if="editTitleAttribute" class="flex">
            <div>
                <input class="w-128 bg-proton-grey-opacity-20 text-xs p-4" v-model="panelTitleAttribute" placeholder="title_attribute"/>
            </div>
            <div class="ml-8">
                <button
                    @click="editTitleAttribute = false"
                    class="bg-proton-grey-opacity-20 text-xs p-4" placeholder="title_attribute"
                >
                    Ok
                </button>
            </div>
        </div>

    </div>
</template>

<script>
    import EditIcon from "~/icons/edit.svg";
    import indexInfoMixin from "@/mixins/indexInfoMixin";

    const isString = function (s) {
        return typeof s === 'string' || s instanceof String;
    };

    export default {
        name: 'HitTitle',
        props: ['panelKey', 'hit'],
        components: {EditIcon},
        mixins: [indexInfoMixin],
        data: function () {
            return {
                editTitleAttribute: false,
            }
        },
        computed: {
            title: function () {
                let titleAttribute = this.panelTitleAttribute;
                const searchableAttributes = this.refIndexSettings.searchableAttributes || this.refIndexSettings.attributesToIndex || [];

                if (titleAttribute.length <= 0) {
                    for (let i in searchableAttributes) {
                        const newTitleAttribute = searchableAttributes[i].split(',')[0];
                        if (isString(this.hit[newTitleAttribute])) {
                            titleAttribute = newTitleAttribute;
                            break;
                        }
                    }
                }

                if (this.hit.highlightResult && this.hit.highlightResult[titleAttribute]) {
                    if (this.hit.highlightResult[titleAttribute].matchLevel) {
                        return this.hit.highlightResult[titleAttribute].value;
                    }
                    return this.hit.highlightResult[titleAttribute];
                }

                return this.hit[titleAttribute] || this.hit.objectID;
            },
        }
    }
</script>