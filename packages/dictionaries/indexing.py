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

'''
DICTIONARIES: https://github.com/algolia/dictionaries/blob/master/out/
'''

# STOPWORDS
nb_stop_words = 0
with open('./dictionaries/out/stopwords/stopwords.txt') as f:
    for line in f:
        split = line.split('=')
        records.append({
            'lang': split[0].strip(),
            'words': [split[1].strip()],
            'type': 'stopword',
            'rank': 1,
        })
        nb_stop_words += 1

print('%s stopwords processed' % nb_stop_words)

# PLURALS
nb_plurals = 0
with open('./dictionaries/out/plurals/plurals.txt') as f:
    for line in f:
        if len(line) == 0 or line.startswith('#') or line == '\n':
            continue

        split = line.split('=')
        records.append({
            'lang': split[0].strip(),
            'words': split[1].strip().split(','),
            'type': 'plural',
            'rank': 2,
        })
        nb_plurals += 1

print('%s plurals processed' % nb_plurals)

# COMPOUNDS
nb_compounds = 0
with open('./dictionaries/out/compounds/compounds.txt') as f:
    for line in f:
        if '=' not in line:
            continue

        split = line.split('=')
        records.append({
            'lang': split[0].strip(),
            'words': split[1].strip().split(','),
            'type': 'compound',
            'rank': 3,
        })
        nb_compounds += 1

print('%s compounds processed' % nb_compounds)

# SEGMENTATION
nb_words = 0
with open('./dictionaries/out/segmentation/cjkt-words.txt') as f:
    for line in f:
        if len(line) == 0 or line.startswith('#') or line == '\n':
            continue

        split = line.split('=')
        records.append({
            'lang': 'cjkt',
            'words': line,
            'type': 'segmentation',
            'rank': 4,
        })
        nb_words += 1

print('%s segmentations processed' % nb_words)


index.replace_all_objects(records, {'autoGenerateObjectIDIfNotExist': True, 'safe': True})
index.set_settings({
    'searchableAttributes': [
        'unordered(words)',
        'unordered(lang)',
    ],
    'attributesForFaceting': [
        'searchable(lang)',
        'type'
    ],
    'customRanking': [
        'asc(rank)'
    ],
})

processingTime = round(time.time() - time_start, 2)
print('%s records imported in %s seconds' % (len(records), processingTime))
