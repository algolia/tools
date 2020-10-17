export default {
    mainIndexName: 'movies_fr',
    countryIndices: ['movies_en', 'movies_es'],
    imageAttribute: 'image',
    gridSize: 3,
    imageSize: 160,
    imageBaseUrl: '',
    imageSuffixUrl: '',
    ignoreImageProxy: '',
    attributesToRetrieve: ['objectID', 'title', 'genre'],
    titleAttributeName: 'title',
    defaultSearchParams: {
        hitsPerPage: 24,
        facets: ['genre', 'actors'],
    },
    cms: [
        {
            name: 'redirect',
            label: 'redirect',
            list: false,
            fields: {
                redirect_url : {
                    type: 'string',
                    default: '',
                },
            },
            merge: function (rule, data) {
                rule.userData = {
                    ...rule.userData,
                    redirect_url: data.url,
                }
            }
        },
        {
            name: 'banner',
            label: 'banners',
            list: true,
            fields: {
                image_url: {
                    type: 'string',
                    default: '',
                },
                position: {
                    type: 'integer',
                    min: 1,
                    default: 1,
                },
                size: {
                    type: 'integer',
                    min: 1,
                    max: 3,
                    default: 1,
                },
                height: {
                    type: 'integer',
                    min: 50,
                    default: 50,
                },
            },
        }
    ]
}
