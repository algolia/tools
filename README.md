This repo contains a set of tools that helps working on algolia related topics like data or relevance. 

> :warning: While being functional/stable and used daily, these tools are not part of the Algolia product offering and need to be used with caution. We highly encourage to use them only on non-production data

## List of tools

| Tool name | Description |
| --- | --- |
| **Metaparams** | allows to quickly test/debug queries and iterate on relevance. |
| **Relevance Testing** | allows to create test case for search results and then compare run the test suites against different version/configuration of the search index. |
| **Index differ** | allows to compare two or more indices settings/synonyms/rules/records |
| **Transform** | allows to import a JSON/CSV file of records, transform the records and then push them to an index |
| **Index analyzer** | allows to understand the data structure of an index and identify data issues |
| **Insights UI** | allows to trigger analytics and insights events without code. |
| **Logs** | allows to visualise realtime log |
| **Apps** | Landing page |

## Install

After making sure that node and yarn are install, at the root of the repo run:

```
yarn install
```

- Go to `packages/css`;
- Run `yarn run build`;
- Run `./copy-css.sh`

## Run a tool

1. Go to `packages/__tool_name__`
2. run `yarn run serve`

If you wish to run the relevance testing tool, you will also need to have https://github.com/algolia/tools-backend repo setup and running.

## Build and host all tools

At the root of the repo run: 

```
yarn run build
```

Then launch the server:

```
node server.js
```

## Getting Help

For any question/issue/proposal, you can open a github issue
**Need help?** You can open a GitHub issue.

## Getting involved

If you **want to contribute** please feel free to **submit pull requests**.
If you have **a feature request** please **open an issue**.

## Licence

InstantSearch iOS is [Apache 2.0 licensed](LICENSE.md)
