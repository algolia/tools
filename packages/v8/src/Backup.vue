<template>
    <div class="mt-24 mr-12 bg-white rounded border border-proton-grey-opacity-80">
        <div class="p-8 border-b border-proton-grey text-xs uppercase tracking-wide bg-proton-grey-opacity-40 text-telluric-blue">
            Backups
        </div>
        <div class="m-16">
            <div class="flex items-center mb-12">
                <h3>Current Draft</h3>
                <div class="ml-24">
                    <div class="text-center" :class="{invisible: !hasBeenSaved}">
                        Saved {{savedConfig === 'new' ? 'draft' : savedConfig}}!
                    </div>
                </div>
            </div>
            <div>
                <div class="flex ml-auto items-center">
                    <div>Save as:</div>
                    <input
                        v-model="saveAs"
                        @keyup.enter="saveScoping(saveAs, true)"
                        class="ml-8 input-custom w-124"
                    />
                    <button
                        @click="saveScoping(saveAs, true)"
                        class="ml-8 block bg-white rounded border border-proton-grey-opacity-40 shadow-sm hover:shadow transition-fast-out mr-8 px-16 p-4 text-sm relative group">
                        Save
                    </button>
                </div>
            </div>
            <h3 class="mt-12 mb-12">Backups</h3>
            <div>
                <div v-for="s in notNewScopings" class="flex">
                    <div class="w-full group">
                        -
                        <a
                            @click="$emit('onUpdateScoping', s.body); saveScoping()"
                            class="text-nebula-blue cursor-pointer hover:underline"
                        >{{s.name}}</a>
                        <trash-icon
                            @click="deleteScoping(s.name)"
                            class="ml-12 w-12 h-12 cursor-pointer hover:text-telluric-blue invisible group-hover:visible"
                        />
                    </div>
                </div>
                <div v-if="notNewScopings.length === 0">
                    No backups
                </div>
            </div>
        </div>
    </div>
</template>

<script>
    import TrashIcon from "common/icons/trash.svg";

    export default {
        name: 'Backup',
        props: ['scoping'],
        components: {TrashIcon},
        data: function () {
            return {
                saveAs: '',
                timeout: null,
                scopings: [],
                hasBeenSaved: false,
                savedConfig: '',
            }
        },
        watch: {
            scoping: function (o, n) {
                if (o !== n) {
                    if (this.timeout) {
                        clearTimeout(this.timeout);
                    }

                    this.timeout = setTimeout(() => {
                        this.saveScoping('new');
                    }, 3000);
                }
            }
        },
        created: function () {
            this.fetchScopings();
        },
        computed: {
            notNewScopings: function () {
                return this.scopings.filter((t) => t.name !== 'new');
            },
        },
        methods: {
            fetchScopings: async function () {
                const endpoint = process.env.VUE_APP_METAPARAMS_BACKEND_ENDPOINT || 'https://tools-backend.algolia.com';
                const res = await fetch(`${endpoint}/scopings/get-all`, {
                    method: 'POST',
                    credentials: 'include',
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({}),
                });
                const scopings = Object.freeze(await res.json());

                if (scopings.length <= 0) {
                    await this.saveScoping('new');
                    this.fetchScopings();
                    return;
                } else {
                    this.$emit('onUpdateScoping', scopings.find((t) => t.name === 'new').body);
                }
                this.scopings = scopings;
            },
            saveScoping: async function (name, reloadScopings) {
                clearTimeout(this.timeout);
                const endpoint = process.env.VUE_APP_METAPARAMS_BACKEND_ENDPOINT || 'https://tools-backend.algolia.com';
                await fetch(`${endpoint}/scopings/update`, {
                    method: 'POST',
                    credentials: 'include',
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        name: name || 'new',
                        body: this.scoping,
                    }),
                });
                this.savedConfig = name || 'new';
                this.hasBeenSaved = true;

                setTimeout(() => {
                    this.hasBeenSaved = false;
                }, 2000);

                if (reloadScopings) {
                    this.fetchScopings();
                }
            },
            deleteScoping: async function (name) {
                const endpoint = process.env.VUE_APP_METAPARAMS_BACKEND_ENDPOINT || 'https://tools-backend.algolia.com';
                await fetch(`${endpoint}/scopings/delete`, {
                    method: 'POST',
                    credentials: 'include',
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        name: name,
                    }),
                });
                this.fetchScopings();
            },
        }
    }
</script>
