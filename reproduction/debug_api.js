
import https from 'https';

function debug() {
    const url = "https://cms.fabry-baumpflege.be/wp-json/content-core/v1/posts/referenzen?per_page=1&language=de";
    https.get(url, (res) => {
        let data = '';
        res.on('data', chunk => { data += chunk; });
        res.on('end', () => {
            const json = JSON.parse(data);
            const item = json[0];
            const img = item.featured_image || {};
            
            console.log("FEATURED IMAGE OBJECT KEYS:", Object.keys(img));
            console.log("SRC:", img.src);
            console.log("URL FIELD:", img.url);
            if (img.variants) {
                console.log("VARIANT 768 URL:", (typeof img.variants['768'] === 'string' ? img.variants['768'] : img.variants['768']?.url));
            }
            console.log("SRCSET:", img.srcset);
            console.log("HAS_V_IN_SRCSET:", (img.srcset || "").includes('?v='));
            process.exit(0);
        });
    }).on('error', err => {
        console.error(err);
        process.exit(1);
    });
}

debug();
