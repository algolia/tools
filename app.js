// Add here your javascript code

var search = instantsearch({
  // Replace with your own values
  appId: '6B29BTPQED',
  apiKey: '49ae085a83962db19658af549b3bac7e', // search only API key, no ADMIN key
  indexName: 'prod_stopwords',
  urlSync: true
});

// initialize SearchBox
search.addWidget(
  instantsearch.widgets.searchBox({
    container: '#search-box',
  })
);

search.addWidget(
  instantsearch.widgets.hits({
    container: '#hits',
    templates: {
      item: '<div class="hit">{{{_highlightResult.lang.value}}}: {{{_highlightResult.word.value}}}</div>'
    }
  })
);

search.addWidget(
  instantsearch.widgets.refinementList({
    container: '#refinement-list',
    attributeName: 'lang',
    operator: 'and',
    limit: 10,
    searchForFacetValues: true,
    templates: {
      header: 'Language'
    }
  })
);

search.addWidget(
  instantsearch.widgets.pagination({
    container: '#pagination',
    maxPages: 50,
    // default is to scroll to 'body', here we disable this behavior
    scrollTo: false,
    showFirstLast: true,
  })
);

search.start();
