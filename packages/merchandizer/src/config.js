export default {
    mainIndexName: 'movies',
    countryIndices: ['movies_en', 'movies_es'],
    gridSize: 3,
    images: {
        imageSize: 160,
        imageBaseUrl: '',
        imageAttribute: 'image',
        imageSuffixUrl: '',
        ignoreImageProxy: '',
        titleAttributeName: 'title',
    },
    attributesToDisplay: ['objectID', 'title', 'genre'],
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
