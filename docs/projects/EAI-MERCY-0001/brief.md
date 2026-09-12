# EAI-MERCY-0001: Mercy Network

Endless AI's second public demonstration connects practical needs, gifts of time or resources, and the fourteen Catholic works of mercy. It complements the existing product realization playground.

## Public experience

- Browse nine fictional profiles, with examples of meals, transportation, housing, small business help, clothing, companionship, and prayer.
- Filter by need, amount, and work of mercy. Open and share a profile through a normal URL.
- Follow contextually relevant words and resource cards to first-party websites.
- Search fourteen curated resource links by subject and service area. Every listing includes its provider, scope, access costs, and review date.
- Prepare personal drafts and giving plans in browser storage. These are **device-local planning tools**, not submissions, accounts, actual gifts, or shared records.
- Read or print the project page for a conversation with potential supporters and operators.

No ChatGPT dependency, external JavaScript service, sign-in, paid API, or backend is required. No contact details or payment credentials are collected. Public examples contain no real recipient information.

## Proposed operating model

An interested parish, charity, or fiscal sponsor would need to agree to operate or support a defined pilot. No partner, legal status, tax treatment, or funding commitment is represented as established.

Start by agreeing on a service area, pilot size, request-review process, safeguarding and privacy responsibilities, support contacts, and a budget. Then add independent authentication, shared storage, moderation and review, approved payment arrangements, and reporting under the participating organization's agreed responsibilities.

The future donor journey may offer direct delivery or organization-coordinated delivery, and named or anonymous-to-recipient gifts. “Anonymous” is not a promise of anonymity from the operator or payment provider. All current choices are local previews; there are no fundraising counters or fake completed donations.

## Resource approach

The editable catalog is `mercy/assets/resources.mjs`. Reviewed September 12, 2026. Source links are referrals, not partnerships, guaranteed eligibility, or live availability checks. Broad directory access is distinguished from any cost for the underlying services.

Optional later integrations to evaluate after the operator is chosen:

- [O*NET Web Services](https://services.onetcenter.org/about): career information; confirm current registration, attribution, and usage terms.
- [USAJOBS API](https://developer.usajobs.gov/): official job information; search requires approved authentication.
- [211 National Data Platform](https://apiportal.211.org/): local-service data subject to access arrangements, not an assumed unrestricted free API.

No API keys belong in these public static files. A later authenticated integration requires an appropriate service backend. The current app sends no personal drafts, story text, or search terms to third-party APIs.

## Technical handoff

The site uses semantic HTML, native ES modules, CSS, and native dialog/form controls. It runs at the repository's GitHub Pages subpath and on other static hosts. All internal links and assets are relative.

- `node scripts/build-mercy.mjs` regenerates the five HTML pages from the shared templates and catalog.
- `node --test tests/mercy.test.mjs` checks resource matching, amount handling, persistence recovery, filtering, and generated navigation.
- `python3 -m http.server 4173` serves the repository for local review; open `/mercy/`.

The existing Pages workflow publishes the repository on a push to `main`. Existing lamp files and documentation are preserved. For a future live donation service, reassess hosting and add the agreed operating infrastructure before accepting real requests or money.
