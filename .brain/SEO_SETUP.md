# Google Search setup

Canonical portfolio: https://mcleinjeionza.vercel.app/
Name searches: McLein Jei Onza, McLein Onza, mcleinjeionza.

## Current status (2026-11-03)

SEO changes are deployed. The public homepage contains the exact Google verification tag, and robots.txt and sitemap.xml are reachable. Search Console Settings confirms the owner is verified for the canonical URL-prefix property. Keep the verification tag in index.html.

Sitemap submission succeeded on November 2, 2026: Google read /sitemap.xml successfully and discovered one page. URL Inspection initially reported the homepage as unknown to Google. The live test at 7:53 PM Asia/Manila confirmed “URL is available to Google” and “Page can be indexed”, with one valid Profile page item.

The November 2 manual Request indexing attempt hit the daily quota. On November 3, the owner supplied a Search Console screenshot confirming “Indexing requested”: the homepage was added to Google's priority crawl queue. Submission is complete; repeated requests do not improve queue position. Indexing and search ranking are still unconfirmed. Reinspect the homepage later for “URL is on Google”; Performance may still be processing data.

## Publish and verify

1. Deploy the SEO changes. Check the homepage, /robots.txt and /sitemap.xml return 200 on the public domain.
2. Open https://search.google.com/search-console/ and add a **URL prefix** property for https://mcleinjeionza.vercel.app/ (the vercel.app parent domain is not owned by this project).
3. Choose **HTML tag** verification. Add Google's exact verification meta tag to index.html's head, deploy, then click Verify. Keep the tag after verification. The tag must come from the owner's Google account; do not invent one.
4. In Sitemaps, submit https://mcleinjeionza.vercel.app/sitemap.xml.
5. Inspect https://mcleinjeionza.vercel.app/ with URL Inspection. Run Test live URL, then Request indexing if available.
6. Monitor Page indexing and Performance. Filter queries by the three name variants. Search results and positions vary; indexing and first-place ranking are not guaranteed.

## Reinforce the identity

- Set the website URL on the owner's GitHub and LinkedIn profiles to the canonical address. Keep the real name consistent across them.
- In Vercel domain settings, change the old onzamj.vercel.app redirect from temporary 307 to permanent 308 if the move is permanent. Source code cannot override a platform-level domain redirect.
- Keep one canonical homepage. Do not create near-duplicate pages for each spelling of the name, add hidden keyword lists, or use the jobs/livestream-only Google Indexing API for this portfolio.

## References

- https://developers.google.com/search/docs/crawling-indexing/ask-google-to-recrawl
- https://developers.google.com/search/docs/appearance/site-names
- https://developers.google.com/search/docs/appearance/structured-data/profile-page
- https://developers.google.com/search/docs/crawling-indexing/301-redirects
