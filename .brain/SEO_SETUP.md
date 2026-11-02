# Google Search setup

Canonical portfolio: https://mcleinjeionza.vercel.app/
Name searches: McLein Jei Onza, McLein Onza, mcleinjeionza.

## Current status (2026-11-02)

The owner’s signed-in Google account now has a pending URL-prefix property for the canonical portfolio. Its exact HTML verification tag is in index.html. Deployment is pending; the Search Console tab is open at HTML tag verification. After deployment, click that method’s Verify button, then submit the sitemap and request homepage indexing. Keep the verification tag in place.

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
