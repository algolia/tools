<template>
    <div class="rounded bg-white m-16 border border-solid border-proton-grey-opacity-60 w-25p">
        <div class="text-telluric-blue text-xs uppercase tracking-wide flex items-center border-b border-t-0 border-proton-grey bg-white p-8 bg-proton-grey-opacity-80">
            Edit: {{test.name}}
        </div>
        <div class="p-8">
            <div>
                {{testData.when}}
            </div>
            <div>
                First Page contains {{testData.firstPageContain}} hits
            </div>
            <div>
                {{testData.nbHits}}
            </div>
            <div>
                {{testData.recordsMatching}}
            </div>
            <div>
                {{testData.should}}
            </div>
        </div>
    </div>
</template>

<script>
    export default {
        name: 'TestEdit',
        props: ['test'],
        computed: {
            testData: function () {
                return this.test.testData;
            }
        }
    }
</script>