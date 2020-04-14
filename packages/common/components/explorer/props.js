export default {
    credentials: ['appId', 'apiKey', 'indexName', 'server', 'method', 'userId'],
    images: ['imageSize', 'imageAttribute', 'imageBaseUrl', 'imageSuffixUrl', 'ignoreImageProxy'],
    attributes: ['titleAttributeName', 'autoTitleAttributeName', 'showSearchableAttributes', 'showCustomRanking', 'showAttributesForFaceting', 'showOnlyMatchingAttributes'],
    paramsAndSettings: ['query', 'searchParams', 'indexSettings', 'keysIndexer'],
    response: ['analyseResponse', 'searchResponse'],
    display: ['analyseMaxNbPoints', 'displayMode', 'displayRankingInfo'],
    actions: ['readOnly', 'isReplica', 'canJumpRules', 'canJumpSynonyms', 'canJumpRecords', 'jumpTo'],
}
