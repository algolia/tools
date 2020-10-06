from algoliasearch.search_client import SearchClient
from algoliasearch.configs import SearchConfig
import time
from os import environ

app_id = environ['DICTS_ALGOLIA_APP_ID']
api_key = environ['DICTS_ALGOLIA_WRITE_API_KEY']
index_name = environ['DICTS_INDEX_NAME']
index_name_tmp = index_name + "_tmp"

# init Algolia
config = SearchConfig(app_id, api_key)
config.batch_size = 10000
client = SearchClient.create_with_config(config)

index_tmp = client.init_index(index_name_tmp)
index_tmp.delete().wait()


index_tmp.set_settings({
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
}).wait().wait()

# vars
time_start = time.time()

'''
DICTIONARIES: https://github.com/algolia/dictionaries/blob/master/out/
'''

# STOPWORDS
stop_words = []
with open('./dictionaries/out/stopwords/stopwords.txt') as f:
    for line in f:
        split = line.split('=')
        stop_words.append({
            'lang': split[0].strip(),
            'words': [split[1].strip()],
            'type': 'stopword',
            'rank': 1,
        })

print('%s stopwords processed' % len(stop_words))
index_tmp.save_objects(stop_words, {'autoGenerateObjectIDIfNotExist': True}).wait()
print('%s stopwords indexed' % len(stop_words))
stop_words = []  # free memory

# PLURALS
plurals = []
with open('./dictionaries/out/plurals/plurals.txt') as f:
    for line in f:
        if len(line) == 0 or line.startswith('#') or line == '\n':
            continue

        split = line.split('=')
        plurals.append({
            'lang': split[0].strip(),
            'words': split[1].strip().split(','),
            'type': 'plural',
            'rank': 2,
        })

print('%s plurals processed' % len(plurals))
index_tmp.save_objects(plurals, {'autoGenerateObjectIDIfNotExist': True}).wait()
print('%s plurals indexed' % len(plurals))
plurals = []  # free memory


# COMPOUNDS
compounds = []
with open('./dictionaries/out/compounds/compounds.txt') as f:
    for line in f:
        if '=' not in line:
            continue

        split = line.split('=')
        compounds.append({
            'lang': split[0].strip(),
            'words': split[1].strip().split(','),
            'type': 'compound',
            'rank': 3,
        })

print('%s compounds processed' % len(compounds))
index_tmp.save_objects(compounds, {'autoGenerateObjectIDIfNotExist': True}).wait()
print('%s compounds indexed' % len(compounds))
compounds = []  # free memory

# SEGMENTATION
words = []
with open('./dictionaries/out/segmentation/segmentation.txt') as f:
    for line in f:
        if len(line) == 0 or line.startswith('#') or line == '\n':
            continue

        split = line.split('=')
        words.append({
            'lang': 'cjkt',
            'words': line,
            'type': 'segmentation',
            'rank': 4,
        })

print('%s segmentations processed' % len(words))
index_tmp.save_objects(words, {'autoGenerateObjectIDIfNotExist': True}).wait()
print('%s segmentations indexed' % len(words))
words = []  # free memory


client.move_index(index_name_tmp, index_name).wait()

print('tmp index moved')

processingTime = round(time.time() - time_start, 2)
print('indexing processs done in %s seconds' % processingTime)
