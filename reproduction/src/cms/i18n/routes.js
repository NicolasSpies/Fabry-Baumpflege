export const ROUTES = {
    DE: {
        home: '/',
        services: '/leistungen',
        about: '/ueber-mich',
        references: '/referenzen',
        referenceDetail: '/referenzen/:slug',
        contact: '/kontakt'
    },
    FR: {
        home: '/fr',
        services: '/fr/services',
        about: '/fr/a-propos',
        references: '/fr/references',
        referenceDetail: '/fr/references/:slug',
        contact: '/fr/contact'
    }
};

export const getLocalizedPath = (key, lang = 'DE') => {
    return ROUTES[lang][key] || ROUTES['DE'][key];
};
