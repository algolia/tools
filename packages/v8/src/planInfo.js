export default {
    addons: [
        {
            key: 'analytics_ret',
            name: 'Analytics Retention (365 days)',
            price: 6000,
        },
        {
            key: 'crawler',
            name: 'Crawler',
            price: 20000,
        },
        {
            key: 'premier_sla',
            name: 'Premier SLA',
            price: 24000,
        },
        {
            key: 'premier_support',
            name: 'Premier Support',
            price: 24000,
            partOfEnterprisePackage: true,
        },
    ],
    dedicatedClusterPrice: 30000,
    packages: [
        {
            key: 'intro_onboarding',
            name: 'Introductory Onboarding',
            price: 12000,
            partOfEnterprisePackage: true,
        },
        {
            key: 'exclu_onboarding',
            name: 'Exclusive Onboarding',
            price: 20000,
        },
        {
            key: 'feature_pack',
            name: 'Feature Pack',
            price: 6500,
        },
    ],
    tranches: [
        {
            min: 0,
            max: 10,
            unitCost: 0,
            premiumUnitCost: 0.0,
        },
        {
            min: 11,
            max: 100,
            unitCost: 1,
            premiumUnitCost: 1.5,
        },
        {
            min: 101,
            max: 500,
            unitCost: 0.9,
            premiumUnitCost: 1.35,
        },
        {
            min: 501,
            max: 1000,
            unitCost: 0.8,
            premiumUnitCost: 1.2,
        },
        {
            min: 1001,
            max: 5000,
            unitCost: 0.7,
            premiumUnitCost: 1.05,
        },
        {
            min: 5001,
            max: 10000,
            unitCost: 0.55,
            premiumUnitCost: 0.77,
        },
        {
            min: 10001,
            max: 50000,
            unitCost: 0.45,
            premiumUnitCost: 0.63,
        },
        {
            min: 50001,
            max: 100000,
            unitCost: 0.35,
            premiumUnitCost: 0.49,
        },
        {
            min: 100001,
            max: 250000,
            unitCost: 0.25,
            premiumUnitCost: 0.35,
        },
        {
            min: 250001,
            max: 500000,
            unitCost: 0.15,
            premiumUnitCost: 0.2,
        },
        {
            min: 500001,
            max: 1000000,
            unitCost: 0.08,
            premiumUnitCost: 0.1,
        },
        {
            min: 1000001,
            max: 5000000,
            unitCost: 0.04,
            premiumUnitCost: 0.05,
        },
        {
            min: 5000001,
            unitCost: 0.02,
            premiumUnitCost: 0.025,
        },
    ]
}
