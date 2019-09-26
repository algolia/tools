// Add here your javascript code

const searchClient = algoliasearch('RSBCBF0EG8', 'c56fcd479e08dadd2a943872a41d3f92');

var search = instantsearch({
  // Replace with your own values
  searchClient,
  indexName: 'prod_dictionaries',
});

// initialize SearchBox
search.addWidget(
  instantsearch.widgets.searchBox({
    container: '#search-box',
    placeholder: 'Search words',
  })
);

search.addWidget(
  instantsearch.widgets.hits({
    container: '#hits',
    templates: {
      item: ` 
        <div class="hit">
            <div class="info">{{type}} – {{{_highlightResult.lang.value}}}</div>
            <div class="words">
              {{#_highlightResult.words}}
                  {{{value}}}
              {{/_highlightResult.words}}
            </div>
        </div>
      `
    }
  })
);

const refinementListWithPanelDictionary = instantsearch.widgets.panel({
  templates: {
    header: 'Dictionary'
  }
})(instantsearch.widgets.refinementList);

search.addWidget(
  refinementListWithPanelDictionary({
    container: '#refinement-list-type',
    attribute: 'type',
    operator: 'or',
    limit: 10,
    sortBy: ['name:asc'],
  })
);

const refinementListWithPanelLanguage = instantsearch.widgets.panel({
  templates: {
    header: 'Language'
  }
})(instantsearch.widgets.refinementList);

search.addWidget(
  refinementListWithPanelLanguage({
    container: '#refinement-list-lang',
    attribute: 'lang',
    operator: 'or',
    limit: 20,
    showMore: true,
    showMoreLimit: 100,
    searchable: true,
    sortBy: ['name:asc'],
    templates: {
      header: 'Language'
    }
  })
);

search.addWidget(
  instantsearch.widgets.pagination({
    container: '#pagination',
    totalPages: 25,
    // default is to scroll to 'body', here we disable this behavior
    scrollTo: false,
    showFirstLast: true,
  })
);

search.start();
