export const ROUTES = {
    DE: {
        home: '/',
        services: '/leistungen',
        about: '/über-mich',
        references: '/referenzen',
        referenceDetail: '/referenzen/:slug',
        contact: '/kontakt'
    },
    FR: {
        home: '/fr',
        services: '/fr/services',
        about: '/fr/uber-moi',
        references: '/fr/references',
        referenceDetail: '/fr/references/:slug',
        contact: '/fr/contact'
    }
};

export const getLocalizedPath = (key, lang = 'DE') => {
    return ROUTES[lang][key] || ROUTES['DE'][key];
};
