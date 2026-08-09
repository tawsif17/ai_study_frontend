# Change Brief

## Context
Shikkha Buddy has crawlable public pages, canonical URLs, robots rules, and a sitemap, but Google does not currently surface `shikkhabuddy.com` for the exact brand query. The homepage leads with a generic title and heading and does not provide structured data identifying the website and organization.

## Goal
Make the canonical Shikkha Buddy domain easier for search engines to discover and understand while improving relevance for Bangladesh SSC MCQ practice searches.

## In-scope
- Brand-first homepage metadata and heading
- Homepage `WebSite` and `Organization` JSON-LD
- More descriptive public Subjects metadata
- Clearer factual About-page positioning
- SEO, crawlability, and structured-data tests

## Out-of-scope
- Guaranteed rankings or indexing timelines
- Paid advertising, backlink purchases, or automated directory submissions
- New blog or thin keyword landing pages
- Social-profile claims that have not been verified
- Backend, API, database, contracts, authentication, and private product pages

## Affected area
- Frontend
- Homepage, Subjects metadata, About copy, and SEO tests

## Contract impact
- No API contract change
- Public metadata and structured-data output change only

## Data impact
- None

## Risks
- Search engines may take days or weeks to recrawl and index the site.
- Inconsistent names or canonical URLs could weaken brand-entity signals.
- Invalid or invented structured-data claims could reduce trust.

## Tests to update
- Unit: metadata, homepage heading, JSON-LD fields, canonical URLs, sitemap, and robots rules
- Integration: production build output contains the expected public SEO signals
- UI: homepage and public-page wording remains accurate and readable

