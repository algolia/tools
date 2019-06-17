from algoliasearch.search_client import SearchClient
from algoliasearch.configs import SearchConfig
import time
from os import environ

app_id = environ['ALGOLIA_APP_ID']
api_key = environ['ALGOLIA_WRITE_API_KEY']
index_name = environ['INDEX_NAME']

# init Algolia
config = SearchConfig(app_id, api_key)
config.batch_size = 10000
client = SearchClient.create_with_config(config)
index = client.init_index(index_name)

# vars
records = []
time_start = time.time()

# stopwords.txt can be found there:
# https://github.com/algolia/dictionaries/blob/master/out/stopwords/stopwords.txt
nb_stop_words = 0
with open('./dictionaries/out/stopwords/stopwords.txt') as f:
    for line in f:
        split = line.split('=')
        records.append({
            'lang': split[0].strip(),
            'words': [split[1].strip()],
            'type': 'stopword'
        })
        nb_stop_words += 1

print('%s stopwords processed' % nb_stop_words)

nb_plurals = 0
with open('./dictionaries/out/plurals/plurals.txt') as f:
    for line in f:
        if len(line) == 0 or line.startswith('#') or line == '\n':
            continue

        split = line.split('=')
        records.append({
            'lang': split[0].strip(),
            'words': split[1].strip().split(','),
            'type': 'plural'
        })
        nb_plurals += 1

print('%s plurals processed' % nb_plurals)


index.replace_all_objects(records, {"autoGenerateObjectIDIfNotExist": True, 'safe': True})
index.set_settings({
    'searchableAttributes': [
        'unordered(words)',
        'unordered(lang)',
    ],
    'attributesForFaceting': [
        'searchable(lang)',
        'type'
    ]
})

processingTime = round(time.time() - time_start, 2)
print('%s records imported in %s seconds' % (len(records), processingTime))
