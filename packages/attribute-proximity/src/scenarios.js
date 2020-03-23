export default {
    scenario1: {
        name: 'A B C',
        queries: [
            'A B C',
            'B A'
        ],
        searchableAttributes: [
            'title',
            'subTitle',
            'description',
            'categories'
        ],
        records: [
            {
                objectID: '1',
                title: 'A B C D',
                subTitle: 'D E',
                description: 'F',
                categories: [],
            },
            {
                objectID: '2',
                title: 'D A B C',
                subTitle: 'D E',
                description: 'F',
                categories: [],
            },
            {
                objectID: '3',
                title: 'A',
                subTitle: 'B C',
                description: 'D F',
                categories: [],
            },
            {
                objectID: '4',
                title: 'A',
                subTitle: 'C B',
                description: 'D F',
                categories: [],
            },
            {
                objectID: '5',
                title: 'E F',
                subTitle: 'A B C',
                description: 'D F',
                categories: [],
            },
            {
                objectID: '6',
                title: 'A',
                subTitle: 'A B C',
                description: 'D E F',
                categories: [],
            },
            {
                objectID: '7',
                title: 'A B C',
                subTitle: 'A B D',
                description: 'D E F',
                categories: [],
            },
            {
                objectID: '8',
                title: 'A',
                subTitle: 'Z',
                description: 'Z',
                categories: ['A', 'B', 'C'],
            },
            {
                objectID: '9',
                title: 'Z',
                subTitle: 'A',
                description: 'Z',
                categories: ['A B C', 'C'],
            },
            {
                objectID: '10',
                title: 'Z',
                subTitle: 'Z',
                description: 'Z',
                categories: ['A', 'B C'],
            },
            {
                objectID: '11',
                title: ['a', 'b'],
                subTitle: ['c', 'd'],
            },
            {
                objectID: '12',
                title: ['a', 'b', 'c', 'd'],
                subTitle: [],
            },
            {
                objectID: '13',
                title: 'A B',
                subTitle: 'D',
                description: 'C',
            },
            {
                objectID: '14',
                title: 'A B',
                subTitle: 'C',
                description: 'D',
            },
        ]
    },
    scenario2: {
        name: 'red shirt',
        queries: [
            'red shirt',
            'shirt'
        ],
        searchableAttributes: [
            'name',
            'colors',
            'description'
        ],
        records: [
            {
                objectID: '1',
                name: 'shirt',
                colors: ['blue'],
                description: 'This shirt also exist in red',
            },
            {
                objectID: '2',
                name: 'shirt',
                colors: ['blue'],
                description: 'Goes well with red dress',
            },
            {
                objectID: '3',
                name: 'shirt',
                colors: ['red'],
                description: 'Goes well with yellow dress',
            },
        ]
    },
    scenario3: {
        name: 'A B',
        queries: [
            'A B C',
        ],
        searchableAttributes: [
            'title',
            'subTitle',
            'description',
        ],
        records: [
            {
                objectID: '16',
                title: 'A',
                subTitle: 'blue',
                description: 'F F F F B C',
            },
            {
                objectID: '15',
                title: 'A',
                subTitle: 'E',
                description: 'B C F F F F',
            },
        ]
    },
    scenario4: {
        name: 'disableProximity',
        queries: [
            'keywords at eu',
            'cool keywords at',
            'porta anter',
            'keywords lorem'
        ],
        searchableAttributes: [
            'title',
            'longtext'
        ],
        customRanking: [
            'popularity'
        ],
        records: [
            {
                objectID: "1",
                title: "sleek title text",
                longtext: "Curabitur risus eros, eleifend a ligula et, elementum sollicitudin arcu. Aliquam convallis a est vitae finibus. Praesent vehicula, lacus sit amet pretium volutpat, metus lectus cursus magna, ac eleifend turpis augue eget metus. Phasellus id mattis turpis. Maecenas ligula metus, maximus ut venenatis nec, mollis quis orci. Vestibulum non placerat ipsum. Donec viverra ultricies velit, sit amet gravida eros sodales sit amet. Nulla consectetur odio sit amet metus dignissim accumsan.",
                popularity: 2,
            },
            {
                objectID: "2",
                title: "close keywords together",
                longtext: "Cool lorem ipsum dolor sit amet, consectetur adipiscing elit. Aenean ante ipsum, volutpat at neque sit amet, laoreet dignissim enim. Nam elementum eros sit amet ipsum sagittis venenatis. Integer elementum sem a facilisis pulvinar. Nullam suscipit ipsum non orci tincidunt, nec consectetur dolor consectetur. Cras sodales, sapien eu scelerisque molestie, arcu ligula vulputate dui, et accumsan felis tortor vel quam. Nulla quam dui, tempor sit amet fermentum ac, dictum in nisl. Proin vestibulum dictum neque, nec tincidunt urna egestas nec. Duis vitae magna lectus. Morbi faucibus lorem et leo euismod tempus. Ut eleifend mi ut elit porttitor interdum. Nulla facilisi. Nulla luctus nisi consectetur tellus imperdiet efficitur.",
                popularity: 3,
            },
            {
                objectID: "3",
                title: "super cool keywords",
                longtext: "Phasellus porta dui ut ante accumsan, quis sollicitudin diam ornare. Integer commodo urna mauris, eget tempor nulla mollis egestas. Quisque at eros lacus. Duis maximus luctus sapien eu dignissim. Vivamus odio odio, eleifend vel purus non, tempor gravida diam. Phasellus lacinia, massa eu varius facilisis, ipsum augue congue arcu, vel scelerisque nunc neque ullamcorper diam. Nunc tempor massa gravida, vehicula nibh a, interdum tellus. Aliquam malesuada massa dolor, in rhoncus arcu interdum a. Sed massa risus, vehicula eget molestie et, sodales nec enim. Nulla dolor ligula, sollicitudin a vulputate quis, lobortis ac erat. In vel aliquet neque. Maecenas tempor fermentum tempor.",
                popularity: 1,
            },
        ]
    }
}
