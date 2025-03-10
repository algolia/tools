# This file is meant as a helper-script to index the data.yml file into Algolia
# for use by the autocomplete functionality when querying for parameters in metaparams.

require 'yaml'
require 'dotenv'
require 'algoliasearch'

Dotenv.load

params = YAML.load(File.read("#{File.dirname(__FILE__)}/data.yml"))

objects = []

params.each do |name, object|
  object['objectID'] = name
  object['name'] = name
  object['param_name'] = name
  object['label'] = name
  object['camel_case_label'] = object['name']
  object['type'] = 'param'
  object['ranking'] = 2
  object['admin_only'] = object['admin_only'] || 0

  if object['values']
    object['values'].each do |value|
      name = value.instance_of?(Hash) ? value['name'] : value
      label = value.instance_of?(Hash) ? "#{name} (#{value['label']})" : name
      label = "#{object['name']}: #{label}"

      objects.push({
                     'objectID': "#{object['name']}_#{name}",
                     'name': name,
                     'display_name': name.to_s,
                     'label': label,
                     'camel_case_label': label,
                     'param_name': object['name'],
                     'scope': object['scope'],
                     'type': 'value',
                     'value_type': object['value_type'],

                     'ranking': 1
                   })
    end
  end

  objects.push(object)
end

client = Algolia::Client.new({
                               application_id: ENV['VUE_APP_APP_ID'],
                               api_key: ENV['VUE_APP_API_KEY']
                             })

index = client.init_index('metaparams')
index.replace_all_objects(objects, { safe: true })

index.set_settings({
                     searchableAttributes: %w[
                       label
                       camel_case_label
                       display_name
                     ],
                     attributesForFaceting: %w[
                       scope
                       type
                       param_name
                       value_type
                       admin_only
                     ],
                     ranking: [
                       'desc(ranking)',
                       'typo',
                       'geo',
                       'words',
                       'filters',
                       'proximity',
                       'attribute',
                       'exact',
                       'custom'
                     ],
                     camelCaseAttributes: [
                       'camel_case_label'
                     ],
                     customRanking: [
                       'desc(ranking)'
                     ],
                     separatorsToIndex: '*'
                   })
