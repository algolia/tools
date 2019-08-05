<template>
    <div class="min-h-screen pb-24">
        <app-header app-name="Relevance Testing">
            <display-config class="mx-16 mt-0 ml-auto"/>
        </app-header>
        <app-management />
        <div class="max-w-960 mx-auto mt-24">
            Relevance Testing
        </div>
    </div>
</template>

<script>
    import AppHeader from "common/components/header/AppHeader";
    import AppSelector from "common/components/selectors/AppSelector";
    import IndexSelector from "common/components/selectors/IndexSelector";
    import CustomSelect from "common/components/selectors/CustomSelect";
    import AppManagement from "common/components/configuration/AppManagement";
    import DisplayConfig from "@/relevance-testing/DisplayConfig";



    class GroupTest {
        constructor() {
            this.tests = [];
        }

        run(algoliaIndex, hitsPerPage) {
            this.tests.forEach((test) => {
                test.run();
            });
        }
    }

    class TestSuite {
        constructor() {
            this.groups = [];
        }

        run(algoliaIndex, hitsPerPage) {
            this.groups.forEach((group) => {
                group.run(algoliaIndex);
            });
        }
    }

    export default {
        name: 'RelevanceTesting',
        components: {DisplayConfig, AppHeader, AppSelector, AppManagement, IndexSelector, CustomSelect},
        data: function () {
            return {

            };
        }
    }
</script>