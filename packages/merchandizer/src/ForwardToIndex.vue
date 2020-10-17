<template>
  <div>
    <div v-if="!saving" class="py-8 flex">
      <div class="w-212">
        <label class="cursor-pointer flex">
          <input type="checkbox" v-model="hasRulesForward" class="mr-4" />
          Forward rules to indices
        </label>
      </div>
      <div v-if="hasRulesForward">
        <div v-for="index in indices" class="text-cosmos-black-opacity-70">
          <label class="cursor-pointer flex">
            <input type="checkbox" v-model="index.value" class="mr-4" />
            {{index.name }}
          </label>
        </div>
        <div class="flex justify-end my-16">
          <div v-if="saveError" class="border border-mars-1 mr-8 p-8 rounded">
            {{ saveError }}
          </div>
          <button
            class="bg-white rounded border border-saturn-2 text-saturn-1 shadow-sm hover:shadow transition-fast-out mr-8 px-16 p-8 text-sm"
            @click="save"
          >
            Save
          </button>
          <button
            class="bg-white rounded border border-b-0 border-proton-grey-opacity-40 shadow-sm hover:shadow transition-fast-out mr-8 px-16 p-8 text-sm"
            @click="cancel"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
    <div
      v-if="saving"
      class="flex items-center justify-center text-nova-grey-opacity-80 py-48"
    >
      <loader-icon class="w-24 h-24 infinte-rotate" />
      <div class="ml-16">Copying Rules...</div>
    </div>
  </div>
</template>

<script>
import LoaderIcon from "common/icons/loader.svg";
import props from "common/components/explorer/props";
import config from "./config";
import { getClient, getSearchIndex } from "common/utils/algoliaHelpers";

export default {
  name: "ForwardToIndex",
  components: { LoaderIcon },
  props: [...props.credentials],
  data: function () {
    return {
      indices: config.indices.countryIndices.map((index) => {
        return { name: index, value: false };
      }),
      saving: false,
      saveError: false,
      hasRulesForward: false,
      config: config,
    };
  },
  methods: {
    save: async function () {
      const client = await getClient(this.appId, this.apiKey);
      const mainIndex = await getSearchIndex(
        this.appId,
        this.apiKey,
        this.indexName
      );
      try {
        this.saving = true;
        await Promise.all(
          this.indices
            .filter((index) => index.value)
            .map(async (index) => {
              const task = await client.copyRules(this.indexName, index.name);
              await mainIndex.waitTask(task["taskID"]);
              index.value = false;
            })
        );
        this.saving = false;
        this.cancel();
      } catch (e) {
        this.saveError = e.message;
      }
    },
    cancel: function () {
      this.hasRulesForward = false;
    },
  },
};
</script>
