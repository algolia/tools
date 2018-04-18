from algoliasearch import algoliasearch
import sys
import time

# initial checks to see if correct params have been supplied
if len(sys.argv) < 4:
    print('Params error, usage: `python %s APP_ID WRITE_API_KEY index_name`' % __file__)
    exit()

app_id = sys.argv[1]
api_key = sys.argv[2]
index_name = sys.argv[3]

if len(app_id) < 10:
    print('APP_ID seems wrong: it must be 10 chars long or more')
    exit()

if len(api_key) != 32:
    print('API_KEY seems wrong: it must be 32 chars long')
    exit()

# init Algolia
client = algoliasearch.Client(app_id, api_key)
index = client.init_index(index_name)

# vars
records = []
total = 0
time_start = time.time()

with open('./per_language_stop_words.txt') as f:
    for line in f:
        split = line.split('=')
        record = {
            'lang': split[0],
            'word': split[1],
        }
        records.append(record)

        total += 1
        if total % 100 == 0:
            print('%s words processed' % total)

index.add_objects(records)

processingTime = round(time.time() - time_start, 2)
print('%s records imported in %s seconds' % (total, processingTime))
