export const ROUTES = {
    DE: {
        home: '/',
        services: '/leistungen',
        about: '/ueber-mich',
        references: '/referenzen',
        referenceDetail: '/referenzen/:slug',
        contact: '/kontakt',
        imprint: '/impressum',
        privacy: '/datenschutz'
    },
    FR: {
        home: '/fr',
        services: '/fr/services',
        about: '/fr/a-propos',
        references: '/fr/references',
        referenceDetail: '/fr/references/:slug',
        contact: '/fr/contact',
        imprint: '/fr/mentions-legales',
        privacy: '/fr/confidentialite'
    }
};

export const getLocalizedPath = (key, lang = 'DE') => {
    return ROUTES[lang][key] || ROUTES['DE'][key];
};
