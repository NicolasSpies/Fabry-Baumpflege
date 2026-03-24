// Using global fetch
// Using regex extraction

const BASE_URL = 'http://localhost:5173';

const auditUrls = [
    { name: 'DE Homepage', url: '/' },
    { name: 'FR Homepage', url: '/fr' },
    { name: 'DE Services', url: '/leistungen' },
    { name: 'FR Services', url: '/fr/services' },
    { name: 'DE Reference Detail', url: '/referenzen/hier-die-dritte-referenz' },
    { name: 'FR Reference Detail', url: '/fr/references/ici-la-3e-reference' },
    { name: 'Overview (Referenzen)', url: '/referenzen' }
];

async function fetchHtml(url) {
    try {
        const res = await fetch(`${BASE_URL}${url}`);
        if (!res.ok) return null;
        return await res.text();
    } catch (e) {
        return null;
    }
}

function extractMeta(html) {
    if (!html) return {};
    const get = (pattern) => {
        const match = html.match(pattern);
        return match ? match[1] : null;
    };

    return {
        title: get(/<title>(.*?)<\/title>/is),
        description: get(/<meta name="description" content="(.*?)"/is),
        canonical: get(/<link rel="canonical" href="(.*?)"/is),
        ogTitle: get(/<meta property="og:title" content="(.*?)"/is),
        ogDescription: get(/<meta property="og:description" content="(.*?)"/is),
        ogUrl: get(/<meta property="og:url" content="(.*?)"/is),
        ogImage: get(/<meta property="og:image" content="(.*?)"/is),
        twitterTitle: get(/<meta name="twitter:title" content="(.*?)"/is),
        twitterDescription: get(/<meta name="twitter:description" content="(.*?)"/is),
        twitterImage: get(/<meta name="twitter:image" content="(.*?)"/is),
        locale: get(/<meta property="og:locale" content="(.*?)"/is),
        lang: get(/<html.*lang="(.*?)"/is)
    };
}

async function runAudit() {
    const results = [];
    for (const item of auditUrls) {
        process.stdout.write(`Fetching ${item.name}... `);
        const html = await fetchHtml(item.url);
        if (html) {
            console.log('Done.');
            results.push({
                name: item.name,
                url: item.url,
                layer3: extractMeta(html)
            });
        } else {
            console.log('Failed (server might be down).');
        }
    }
    console.log(JSON.stringify(results, null, 2));
}

runAudit();
