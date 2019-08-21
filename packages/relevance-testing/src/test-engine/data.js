export default {
    id: 1,
    name: 'MoviesSuite',
    runs: [
        {
            appId: 'AJ0P3S7DWQ',
            indexName: 'movies',
            apiKey: 'ce1181300d403d21311d5bca9ef1e6fb',
            hitsPerPage: 8,
            params: {},
        },
        {
            appId: 'AJ0P3S7DWQ',
            indexName: 'movies_test_regression',
            apiKey: 'ce1181300d403d21311d5bca9ef1e6fb',
            hitsPerPage: 8,
            params: {},
        }
    ],
    groups: [
        {
            name: "london queries",
            tests: [
                {
                    name: "should contain a title with London",
                    when: {
                        query: "london",
                    },
                    then: [
                        {
                            test: 'contains',
                            operator: '>=',
                            value: 1,
                            recordsMatching: [
                                {
                                    type: "attribute",
                                    key: "title",
                                    operator: "=",
                                    value: "London"
                                }
                            ]
                        }
                    ]
                },
                {
                    name: "should contain a title with Interstellar at positon 0",
                    when: {
                        query: "london",
                    },
                    then: [
                        {
                            test: 'contains',
                            operator: '=',
                            value: 1,
                            recordsMatching: [
                                {
                                    type: "attribute",
                                    key: "title",
                                    operator: "=",
                                    value: "Interstellar"
                                },
                                {
                                    type: "position",
                                    operator: "=",
                                    value: 0
                                }
                            ],
                        }
                    ],
                },
                {
                    name: "should contain at least 2 drama",
                    when: {
                        query: "london",
                    },
                    then: [
                        {
                            test: 'contains',
                            operator: '>=',
                            value: 2,
                            recordsMatching: [
                                {
                                    type: "attribute",
                                    key: "genre",
                                    operator: "=",
                                    value: "Drama"
                                },
                            ],
                        }
                    ],
                },
                {
                    name: "should have at least 2 hits",
                    when: {
                        query: "london",
                    },
                    then: [
                        {
                            test: 'nbHits',
                            operator: '>=',
                            value: 2,
                            recordsMatching: [],
                        }
                    ],
                },
            ]
        },
        {
            name: 'failing queries',
            tests: [
                {
                    name: "should contain a title with lolilol",
                    when: {
                        query: "london",
                    },
                    then: [
                        {
                            test: 'contains',
                            operator: '>=',
                            value: 1,
                            recordsMatching: [
                                {
                                    type: "attribute",
                                    key: "title",
                                    operator: "=",
                                    value: "lolilol"
                                },
                                {
                                    type: "position",
                                    operator: "=",
                                    value: 0
                                }
                            ],
                        }
                    ],
                }
            ]
        },
        {
            name: 'Multiple conditions',
            tests: [
                {
                    name: 'Match several objects with independent conditions',
                    when: {
                        query: "london",
                    },
                    then: [
                        {
                            test: 'contains',
                            operator: '>=',
                            value: 1,
                            recordsMatching: [
                                {
                                    type: "attribute",
                                    key: "title",
                                    operator: "=",
                                    value: "London"
                                },
                                {
                                    type: "position",
                                    operator: "=",
                                    value: 1
                                }
                            ],
                        },
                        {
                            test: 'contains',
                            operator: '>=',
                            value: 1,
                            recordsMatching: [
                                {
                                    type: "attribute",
                                    key: "title",
                                    operator: "=",
                                    value: "London Boulevard"
                                }
                            ]
                        }
                    ]
                }
            ],
        }
    ]
};