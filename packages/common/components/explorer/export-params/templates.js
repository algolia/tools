export default {
    layout: {
        php: `
            <?php
            // install: composer require algolia/algoliasearch-client-php
            require 'vendor/autoload.php';
            use Algolia\\AlgoliaSearch\\SearchClient;
            
            $client = SearchClient::create(
                '__APP_ID__',
                '__API_KEY__'
            );
            $index = $client.initIndex('__INDEX_NAME__');
            
            __METHOD__
            
            var_dump($res);
        `,
        ruby: `
            # install: gem install algoliasearch
            require 'rubygems'
            require 'algoliasearch'
            
            Algolia.init(
                application_id: '__APP_ID__',
                api_key: '__API_KEY__'
            )
            index = Algolia::Index.new('__INDEX_NAME__')
            
            __METHOD__
            
            p(res)
        `,
        javascript: `
            // install:  yarn add algoliasearch
            const algoliasearch = require('algoliasearch');
            
            const client = algoliasearch(
                '__APP_ID__',
                '__API_KEY__'
            );
            const index = client.initIndex('__INDEX_NAME__');
            
            __METHOD__
        `,
        python: `
            # install: pip install --upgrade algoliasearch
            from algoliasearch import algoliasearch
    
            client = algoliasearch.Client("__APP_ID__", '__API_KEY__')
            index = client.init_index('__INDEX_NAME__')
            
            __METHOD__
            
            print res
        `,
        curl: `
            __METHOD__
        `,
    },
    search: {
        php: `
            $res = $index->search('__QUERY__', [
            __PARAMS__
            ]);
        `,
        ruby: `
            res = index.search('__QUERY__', {
            __PARAMS__
            })
        `,
        javascript: `
            index.search({
                query: '__QUERY__',
            __PARAMS__
            }).then((content) => {
                console.log(content);
            });
        `,
        python: `
            res = index.search("__QUERY__", {
            __PARAMS__    
            })
        `,
        curl: `
            curl -X POST \\
            -H "X-Algolia-Application-Id: __APP_ID__" \\
            -H "X-Algolia-API-Key: __API_KEY__" \\
            --data-binary '{ "params": "query=__QUERY____PARAMS__" }' \\
            "https://__APP_ID__-dsn.algolia.net/1/indexes/__INDEX_NAME__/query"
        `
    },
    setSettings: {
        php: `
            $res = $index->setSettings([
            __PARAMS__
            ]);
        `,
        ruby: `
            res = index.set_settings({
            __PARAMS__
            })
        `,
        javascript: `
            index.setSettings({
            __PARAMS__
            }).then((content) => {
                console.log(content);
            });
        `,
        python: `
            res = index.set_settings({
            __PARAMS__    
            })
        `,
        curl: `
            curl -X PUT \\
            -H "X-Algolia-Application-Id: __APP_ID__" \\
            -H "X-Algolia-API-Key: __API_KEY__" \\
            --data-binary '__PARAMS__' \\
            "https://__APP_ID__.algolia.net/1/indexes/__INDEX_NAME__/settings?forwardToReplicas=false"
        `
    }
};