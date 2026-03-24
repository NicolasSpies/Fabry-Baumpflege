# Post-Update SEO & Data Fetching Audit

## Route: /

1. Route Resolution:
   - Slug:      startseite
   - Type:      page
   - isDetail:  true

2. API Call:
   - Endpoint:  https://cms.fabry-baumpflege.be/wp-json/content-core/v1/post/page/slug/startseite?lang=de
   - Strategy:  /post/ (detail)

3. Response Shape:
   - Format:    Object {}

4. Content Check:
   - CMS seo.title: "Fabry Baumpflege | Baum und Gartenpflege in Ostbelgien"

5. Errors / Fallbacks:
   - Fallback Triggered: NO
------------------------------------------------------------

## Route: /fr

1. Route Resolution:
   - Slug:      page-daccueil
   - Type:      page
   - isDetail:  true

2. API Call:
   - Endpoint:  https://cms.fabry-baumpflege.be/wp-json/content-core/v1/post/page/slug/page-daccueil?lang=fr
   - Strategy:  /post/ (detail)

3. Response Shape:
   - Format:    Object {}

4. Content Check:
   - CMS seo.title: "Fabry Baumpflege | Entretien des arbres et jardins"

5. Errors / Fallbacks:
   - Fallback Triggered: NO
------------------------------------------------------------

## Route: /leistungen

1. Route Resolution:
   - Slug:      leistungen
   - Type:      page
   - isDetail:  false

2. API Call:
   - Endpoint:  https://cms.fabry-baumpflege.be/wp-json/content-core/v1/posts/page?slug=leistungen&lang=de&per_page=1
   - Strategy:  /posts/ (collection)

3. Response Shape:
   - Format:    Array []

4. Content Check:
   - CMS seo.title: "Fabry Baumpflege | Leistungen für Baum und Garten"

5. Errors / Fallbacks:
   - Fallback Triggered: NO
------------------------------------------------------------

## Route: /fr/services

1. Route Resolution:
   - Slug:      services
   - Type:      page
   - isDetail:  false

2. API Call:
   - Endpoint:  https://cms.fabry-baumpflege.be/wp-json/content-core/v1/posts/page?slug=services&lang=fr&per_page=1
   - Strategy:  /posts/ (collection)

3. Response Shape:
   - Format:    Array []

4. Content Check:
   - CMS seo.title: "Fabry Baumpflege | Services pour les arbres et le jardin"

5. Errors / Fallbacks:
   - Fallback Triggered: NO
------------------------------------------------------------

## Route: /referenzen/hier-die-zweite-referenz

1. Route Resolution:
   - Slug:      hier-die-zweite-referenz
   - Type:      reference
   - isDetail:  true

2. API Call:
   - Endpoint:  https://cms.fabry-baumpflege.be/wp-json/content-core/v1/post/referenzen/slug/hier-die-zweite-referenz?lang=de
   - Strategy:  /post/ (detail)

3. Response Shape:
   - Format:    Object {}

4. Content Check:
   - CMS seo.title: "Fabry Baumpflege | Hier die zweite Referenz"

5. Errors / Fallbacks:
   - Fallback Triggered: NO
------------------------------------------------------------

