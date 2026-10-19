# Ireland market — design

**Date:** 2026-10-19
**Status:** approved design, ready to plan

## Intent and the why

DayDrive currently sells 1-day motor insurance to UK drivers at a `.co.uk`
domain. We want to sell the same product to Irish drivers at a `.ie` domain.

The Irish site is a **second permanent market, not a migration**. The UK site
stays live and keeps receiving features indefinitely. Both markets are expected
to evolve together: a feature built for one is normally wanted by the other.

That single fact drives the whole design. The obvious-looking approach — a
long-lived `main-ireland` branch deployed as its own Vercel project — was
considered and rejected, because it means every change for the rest of the
product's life is written once and merged twice, and the merge conflicts
concentrate in exactly the files that differ per market. The cost grows without
bound and peaks precisely when the two markets have drifted furthest apart.

Instead: **one codebase, one `main`, one commit, two configured deployments.**
A market is a configuration of the application, not a version of it.

This is viable because almost everything that differs between the two markets
is already environment-driven in the current code. See "Current state".

## Scope posture — read this first

The product owner has decided that **Ireland launches on today's product and
today's document text**, with textual corrections to follow later:

- Same underwriter named in the documents.
- Same Business cover, same delivery-platform list.
- Same single tax-inclusive premium figure, same IPT wording.
- The `.ie` site may be publicly reachable before Irish legal text is
  finalised.

This is a deliberate decision to ship the market mechanics first and correct
the wording afterwards, and it makes this a contained piece of work. The
consequence, recorded here so that whoever picks this up is not surprised by
it, is that **until that wording lands, an Irish customer receives documents
that name an England-and-Wales underwriter and FCA regulation, cite English
law and Great Britain geographical limits, and assert UK Insurance Premium Tax
on a euro premium.** Specifically:

- `CertificateDocument.tsx:302, :304` — FCA authorisation (firm ref 751221) and
  "Highway Insurance Company Limited, registered in England and Wales 3730662"
- `PolicyWordingDocument.tsx:106, :162, :231, :245, :267` — the same insurer as
  risk carrier, as data controller, as the definition of "we/our/us", and
  English law as the governing law
- `PolicyWordingDocument.tsx:230` — geographical limits: Great Britain,
  Northern Ireland, Isle of Man, Channel Islands
- `IpidDocument.tsx:140, :176, :199, :218, :219` — `Country of Issue: "UK"`,
  UK residency and UK licence declarations, registered in / not exported from
  the UK
- `apps/web/public/complaints.html`, `privacy.html`, `terms.html` — Financial
  Ombudsman, UK GDPR / ICO, England-and-Wales governing law
- `QuotePage.tsx:97`, `PolicyScheduleDocument.tsx:161`,
  `TermsOfBusinessDocument.tsx:106, :193` — Insurance Premium Tax, which does
  not exist in Ireland (non-life premiums there carry 3% government stamp duty
  and a 2% Insurance Compensation Fund levy)
- `LandingPage.tsx:325, :447` — "full UK/EU licence", FCA firm ref 407863

The design's job is therefore to build the **mechanism** by which each of those
strings becomes per-market, so that supplying the Irish wording later is a data
change and not a second project. Correcting the wording itself is explicitly
out of scope for this work.

## Goals

1. A customer at the `.ie` domain can buy 1-day cover for an Irish-registered
   vehicle, pay in euro through a separate Stripe account, and receive policy
   documents from a separate Irish database.
2. The UK site's behaviour is **unchanged**, byte-for-byte, in its documents and
   its pricing. Nothing about this work is visible to a UK customer.
3. One commit serves both markets. A feature built once appears in both unless
   deliberately gated.
4. Irish customer data lives in its own database, in the EU, with its own
   Stripe account.
5. Every string identified above is reachable from a per-market configuration
   surface, so the later wording corrections touch data, not code.
6. A misconfigured market deployment fails loudly at boot rather than serving
   wrong-market content or charging through the wrong Stripe account.

## Non-goals

- **Writing or correcting the Irish regulatory wording.** Out of scope by
  decision above. The mechanism is in scope; the content is not.
- Combined cross-market admin or reporting. Each market's admin panel reads its
  own database only. A later read-only combined dashboard is anticipated but
  not part of this work.
- Migrating any existing data. The Irish database starts empty.
- Multi-currency within a market. Each deployment has exactly one currency.
- Itemising Irish insurance levies. Decided: single tax-inclusive figure.
- **Any visual difference between the markets at all.** Decided: both markets
  ship the identical theme — same palette, logo, typography and imagery, in
  both the web app and the documents. The product owner will say if and when a
  different Irish look is wanted.

  This was investigated before being deferred, and the finding is worth keeping
  because it makes the deferral safe: the entire web look runs through three
  Tailwind tokens, with only 10 raw hex values in all of `apps/web/src`, so
  introducing a per-market palette later is a contained change to
  `tailwind.config.js` selected from `VITE_MARKET` at build time. See
  "Deferred: theming" below for the detail.
- **A separate Irish brand.** Decided: same DayDrive name and logo in both
  markets. No new artwork, and no changes to logo files, document footers,
  email templates, page titles or the trademark line.
- Generalising to an arbitrary number of markets. The design should not
  obstruct a third market, but we are not building for one.
- Localisation or translation. Both markets are in English.

## Anti-goals — what makes this a failure even if it technically works

- **A UK customer receives a document or price that changed.** The UK product
  is live and regulated. Any diff visible to a UK customer is a defect, not a
  side effect. This is the single most important constraint in the document.
- **The two markets' data or payments mix.** An Irish policy in the UK
  database, or an Irish payment reaching the UK Stripe account, is a reportable
  incident. Isolation must be structural, not conventional.
- **A market deployment silently falls back to the other market's defaults.**
  See the `required()` fallback hazard under Constraints.
- **Market branching metastasises through the codebase.** If `MARKET === "ie"`
  checks end up scattered through routers, pages and components, we have
  rebuilt the branch inside the code and gained nothing. Market differences
  belong in a small number of declared configuration surfaces, read by code
  that does not itself know which market it is serving. If a reviewer can count
  the market conditionals on one hand, the design held.
- **The later wording correction turns out to need a code change.** If
  supplying the Irish strings means editing templates rather than editing
  configuration, this work did not achieve its purpose.

## Current state

An npm-workspaces monorepo: `apps/api` (Express 4, Prisma, Postgres on Neon),
`apps/web` (Vite, React 18), `packages/shared-types` (Zod schemas). Two Vercel
projects deploy it today, one per app. `main` is the only long-lived branch.

**Already environment-driven — no code change needed:**

| Market difference | Existing mechanism |
|---|---|
| Database | `DATABASE_URL` |
| Stripe | `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `VITE_STRIPE_PUBLISHABLE_KEY` |
| Domains | `APP_BASE_URL`, `API_BASE_URL`, `VITE_API_BASE_URL` |
| Sender address | `EMAIL_FROM` |
| Document storage | `DOCUMENT_STORAGE`, `S3_*` / `LOCAL_DOCS_DIR` |
| Session signing | `SESSION_SECRET` |

**Already country-aware in code:**

- `packages/shared-types/src/vehicle.ts` defines `lookupCountrySchema`
  (`"uk" | "ie"`), separate `ukRegistrationSchema` and `irishRegistrationSchema`,
  and `registrationSchemaFor(country)`.
- `apps/api/src/providers/vehicle-lookup/factory.ts` already routes `country
  === "ie"` to `RegCheckIrelandProvider` regardless of
  `VEHICLE_LOOKUP_PROVIDER`, which only ever selected between UK sources.
- `Quote.currency` is a column (`apps/api/prisma/schema.prisma:74`) defaulting
  to `"gbp"`, passed straight to Stripe in
  `apps/api/src/modules/checkout/router.ts:58`. **Euro needs no migration.**
- `colour` is already optional throughout, rendering `—` when absent
  (`VehicleConfirmPage.tsx:58`). Irish lookups return no colour
  (`regcheck-ireland-provider.ts:73`) and classify every vehicle as `car`,
  which is harmless because vehicle type no longer affects pricing. **No work
  needed on the plumbing** — but see the data-quality note below.
- **The RegCheck Ireland account works.** Verified live on 2026-10-19 against
  the fallback `daydrive` username: a real Irish plate returned real vehicle
  data (make, model, registration year, body style, county). The Irish lookup
  path is functional, not theoretical. Note that `REGCHECK_USERNAME` is **not
  set in any environment** and the working value is the in-code default at
  `env.ts:27`. It should be set explicitly on both markets so the account the
  product depends on is declared rather than implied.
- Document storage keys are `policies/${policyId}/${type}.pdf` with a
  collision-free policy id, so a shared bucket would not corrupt data — but a
  separate store is still wanted for data residency.

**Deferred: theming.** Out of scope by decision. Recorded because it was
investigated, and because the findings are what make the deferral cheap to
reverse:

- The entire web look runs through three Tailwind tokens in
  `apps/web/tailwind.config.js`: `ink` (386 uses — text and dark surfaces),
  `mint` (124 — the green brand accent) and `paper` (21 — page background).
- There are only **10 raw hex values in the whole of `apps/web/src`**, and the
  stock Tailwind palette classes in use are purely status colours (`red-*` for
  errors, `amber-*` for warnings) which must stay identical across markets.
  Changing the Irish accent is therefore a matter of redefining token values,
  not auditing components.
- **Dead theme config:** `brand` (a full 50–900 scale), `accent` and `plate`
  are defined and used **zero** times. `mint` duplicates `brand`'s green, and
  the number-plate yellow is hardcoded as `#ffd80a` in `LandingPage.tsx`
  instead of using the `plate` token. A contributor editing `brand` today
  would see no effect at all. Tidying this is a prerequisite for per-market
  theming but is **not** part of this work — with theming deferred it would be
  unnecessary churn in files the UK market depends on.
- The PDF templates are react-pdf, not Tailwind, and hold **91 hardcoded hex
  values**. Out of scope by decision, recorded here so the next person knows
  the web tokens do not reach the documents.

**Not yet market-aware — the actual work:**

1. **Registration country is inferred from the typed plate, not configured.**
   `LandingPage.tsx:51, :59` compute `isIrish` from the input's shape and pick
   the schema from it. In the Irish market the country must be fixed by
   configuration, and a UK plate must be refused.
2. **Pricing is a flat table with no currency.**
   `apps/api/src/modules/quote/pricing.config.ts` holds `PERSONAL: 1500,
   BUSINESS: 2500` with no notion of market or currency.
3. **`£` is hardcoded in 8 web files and 7 API files.** Full list below.
4. **The PDF templates and static legal pages carry hardcoded UK text.** Listed
   under "Scope posture" above.
5. **Driver licence validation is UK-format-only.**
   `packages/shared-types/src/quote.ts:24-30` enforces the DVLA pattern with
   the message "Enter a valid UK driving licence number". An Irish driver who
   enters their licence number is rejected today. The field is optional, so
   declining to share it works — but supplying a valid Irish number fails.
6. **Policy numbers collide across markets.**
   `apps/api/src/modules/checkout/policy-number.ts:18` formats
   `Policy-2023-000001` from a per-database sequence. The unique constraint is
   per-database, so both markets would independently issue the same numbers
   with no error raised.
7. **Static legal pages are outside any config surface.**
   `apps/web/public/*.html` is copied verbatim into both builds by Vite, so no
   React-level configuration can reach them. A build-time mechanism is needed.
8. **Irish lookup data is thinner than UK data, and one field is wrong.**
   Verified against the live API. RegCheck returns `FuelType` as a
   single-letter code — `"D"` for the Porsche Macan tested — and
   `regcheck-ireland-provider.ts:75` passes it straight through, so
   `VehicleConfirmPage.tsx:64` shows an Irish customer the letter `D` as their
   fuel type. It also returns no colour and no type-approval data. Net effect:
   three of the five fields on the Irish vehicle-confirm page are degraded —
   colour renders `—`, fuel type renders a bare letter, and vehicle type is
   always `car`. The fuel-type code needs mapping to a label; the builder
   should decide whether colour is worth capturing from the customer on the
   Irish flow or whether `—` is acceptable.

## Constraints

- **The UK deployment's rendered documents and prices must not change.** This
  is testable and must be tested; see "Testing".
- **Irish regulatory strings are supplied, never invented.** When the wording
  does arrive, the builder must not write a regulator name, registration
  number, firm reference, geographical limits or declaration wording from its
  own knowledge. For this piece of work the Irish values are simply the UK
  values, by decision, which sidesteps the issue entirely — but the mechanism
  must not tempt a future contributor into inventing them.
- **`required()` in `apps/api/src/config/env.ts` takes a fallback**, and
  several market-critical variables use one: `STRIPE_SECRET_KEY` falls back to
  `"sk_test_demo_placeholder"`, `STRIPE_WEBHOOK_SECRET` to
  `"whsec_demo_placeholder"`, `APP_BASE_URL` to `localhost:5173`. A new Irish
  deployment missing a variable will boot happily and misbehave. Market-critical
  variables must have no production fallback.
  (`CHECK_CAR_DETAILS_API_KEY` has a real-looking key as its in-code default at
  `env.ts:25`. Pre-existing, worth raising separately, not in scope.)
- **`apps/api/vercel.json` is one file shared by both API projects.** Anything
  market-specific — region, headers, crons — must be a Vercel *project
  setting*, not a repo file. Same for `apps/web/vercel.json`.
- **The Irish database and document store must be in an EU region** (Neon
  `eu-central-1` or equivalent) for data residency.
- Vercel's Node runtime serves `dist/src/app.js` as the API's root entrypoint
  and ignores the `api/` directory. **Do not reintroduce a catch-all rewrite in
  `apps/api/vercel.json`**; it 404s every route. This caused a production
  outage on 2026-10-18, fixed in `219f210`.
- RegCheck authenticates by username alone, in the query string
  (`env.ts:27`). Whether Ireland reuses the existing `daydrive` account is a
  commercial question; the variable exists either way.
- There is no seed script and no admin-creation code path — `role` is only ever
  checked (`apps/api/src/middleware/require-auth.ts:50`). The Vercel build
  command runs `prisma generate` but **not** `prisma migrate deploy`.

## The parts of the how that were decided

Settled with the product owner; not open:

1. **One `main`. No `main-ireland` branch, no fork.** Both markets deploy from
   the same commit.
2. **Four Vercel projects**, two per market (API and web), each with its own
   environment variables. The existing two UK projects gain one new variable
   and are otherwise untouched.
3. **A single `MARKET` variable** (`"uk" | "ie"`) is the only new input that
   selects market behaviour. Read once at startup into the existing config
   object on the API side; exposed as `VITE_MARKET` on the web side. The UK
   projects set `MARKET=uk` explicitly rather than relying on a default, so
   neither market is privileged in configuration.
4. **Separate admin per market.** `daydrive.ie/admin` reads the Irish database
   only; admin staff hold separate accounts per market. Admin users live in the
   same `User` table as customers (`schema.prisma:21`), so this falls out of the
   separate database with no code change. A combined view was explicitly
   rejected as too costly: it would require the API to hold connections to both
   databases and resolve one per request, touching every admin query, the audit
   log and both document download paths, with corresponding leakage risk.
5. **Irish pricing is €15 personal / €25 business** — the same figures as the
   UK, denominated in euro. Stored as `1500` and `2500` with
   `Quote.currency = "eur"`.
6. **The Irish market rejects UK registrations.** The country is fixed by
   configuration, not inferred from the plate's shape. A UK plate on the Irish
   site is a validation error.
7. **Separate database, separate Stripe account, separate document store.**
8. **Document content, Business cover, platform list and tax treatment are
   unchanged from the UK** for this piece of work. See "Scope posture".
9. **The `.ie` site may be publicly reachable before the Irish wording lands.**
   No deployment protection or launch gate is required.
10. **Both markets ship the identical theme.** No per-market palette, no
    `tailwind.config.js` change, no document theming. The product owner will
    raise a different Irish look as a separate request if it is wanted.

## Calls made by the designer

Minor decisions settled here so the builder is not left guessing. Any of these
can be overridden.

- **Static legal pages** (`apps/web/public/*.html`) are handled by selecting
  market-suffixed files at build time, the cheapest mechanism that works with
  Vite's verbatim `public/` copy. For this work the Irish variants are copies
  of the UK ones, so the selection mechanism ships exercised but inert.
- **Driver licence validation becomes market-parameterised**, the same way the
  vehicle registration schema already is. For Ireland the check is relaxed to a
  loose non-empty validation rather than a format pattern, because the field is
  optional and inventing an Irish format would violate the constraint above.
  Worth confirming with the product owner whether Irish licence capture is
  wanted at all.
- **The address field is relabelled per market** — "Postcode" becomes
  "Eircode" on the Irish site. Validation is already loose
  (`postcode: z.string().min(2)`) and does not change.
- **Policy numbers gain a per-market prefix** so the two databases cannot issue
  the same number. The existing UK format must not change, so the prefix is
  additive for Ireland only. The builder should confirm the insurer has no
  format requirement before choosing the exact shape.
- **Vercel function regions are pinned to the EU on the Irish projects** via
  project settings, since Irish personal data would otherwise be processed in
  Vercel's default US region. Whether an Irish DPA, a DPIA, or EU-region Resend
  and Stripe configuration are also expected is a compliance question outside
  this design.
- **`MARKET` is required with no fallback on the API.** Combined with decision
  3, this means the UK Vercel projects must have `MARKET=uk` set *before* the
  commit that reads it is deployed, or the UK API will fail to boot. Failing
  loudly was chosen over a silent default precisely because a silent default is
  the anti-goal above; the ordering is a release-runbook item, not a code
  concern.
- **No placeholder-failing tests.** The earlier draft proposed tests that fail
  until Irish wording is supplied. Given decision 8, there is no placeholder
  wording, so that mechanism is dropped. Per-market rendering assertions still
  apply.

## What's left to the builder

### Market configuration surface

Introduce one declared, per-market configuration surface rather than scattering
`MARKET === "ie"` conditionals. The builder chooses the exact shape. It should
cover at least: country code; currency code and symbol; locale and time zone
for date formatting; the pricing table; registration-plate schema selection;
driver licence schema selection; address-field labelling; the set of
regulatory, brand and tax strings used by the PDF and email templates; the
policy-number prefix. Consuming code should read from this surface without
branching on the market itself, so that adding a third market is a data change.

The surface should be shaped so that a palette could join it later without
restructuring, since theming is the most likely next addition — but no theme
work happens now and `tailwind.config.js` is not touched.

Note that for this piece of work the Irish and UK values are **identical for
every regulatory and tax string**. That makes the refactor unusually safe to
verify — a correct implementation produces byte-identical documents for both
markets apart from currency — and it is the strongest available check that the
UK market was not disturbed.

### Known hardcodings to route through that surface

`£` appears in:

- Web: `PortalPage.tsx`, `PortalPolicyDetailPage.tsx`, `QuotePage.tsx`,
  `LandingPage.tsx` (including the `£15`/`£25` marketing tiles at `:17–18`),
  `admin/AdminDashboardPage.tsx`, `admin/AdminPoliciesPage.tsx`,
  `admin/AdminPolicyDetailPage.tsx`, `admin/AdminUserDetailPage.tsx`
- API: `modules/quote/pricing.config.ts`, `modules/documents/service.ts`,
  `modules/email/templates.ts`, and the templates
  `PolicyWordingDocument.tsx`, `TermsOfBusinessDocument.tsx`,
  `IpidDocument.tsx`, `PolicyScheduleDocument.tsx`
- Tests: `modules/quote/pricing.test.ts`, `modules/documents/watermark.test.ts`

`en-GB` / `Europe/London` date formatting appears in `PortalPage.tsx`,
`CoverDetailsPage.tsx`, `PortalPolicyDetailPage.tsx`, `DateRangeFilter.tsx`,
`admin/AdminDashboardPage.tsx`, `admin/AdminUsersPage.tsx`,
`admin/AdminEventsPage.tsx`, `admin/AdminPolicyDetailPage.tsx`. Ireland shares
`Europe/Dublin` time with London in practice, so the builder may treat the time
zone as lower priority than the currency — but the locale should come from
configuration rather than being hardcoded.

### Testing

The repository's convention is pure unit tests under `src/**/*.test.ts` run by
Vitest; there is no supertest and no integration harness. **Vitest's `include`
is `src/**/*.test.ts`, so a test placed outside `src/` is silently not
collected** — this has bitten before.

Two things need coverage beyond the usual:

1. **A UK regression guard on the documents**, established *before* any
   template is touched, so the market refactor is provably invisible to the UK
   market. Snapshot or explicit assertions over the rendered UK document text;
   the builder decides the mechanism. The requirement is that a change to UK
   wording cannot merge unnoticed.
2. **Per-market rendering assertions** — for this work, that both markets
   render the same regulatory text and differ only in currency. When the Irish
   wording eventually lands, these become the tests that assert each market
   carries its own regulator and not the other's.

Two pre-existing failures on `main` are unrelated to this work:
`watermark.test.ts` ×2 (a pdf-parse XRef error) and `regcheck-ireland.test.ts`
failing to collect without `DATABASE_URL` set. The builder should not be
alarmed by them and should not fix them as part of this work.

### Deployment and operations

The plan must include, as explicit steps:

- Setting `MARKET=uk` on both UK Vercel projects before deploying the commit
  that reads it.
- Creating the Irish Neon database in an EU region and running
  `prisma migrate deploy` against it — the Vercel build command does not.
- Bootstrapping the first Irish admin account. There is no seed script and no
  admin-creation code path, so the builder should establish how this is done
  today in production and either reuse that or add a documented script.
- A **two-database release step**: from launch onward every migration must be
  applied to both databases. This is a change to the release process and
  belongs in the plan, not in a launch-day discovery.
- Pinning the Irish projects' function region, as a project setting rather than
  in the shared `vercel.json`.

### Open items for the product owner, not blocking

- The exact `.ie` domain and the brand name for Irish documents and the Irish
  email sender address.
- Whether Ireland reuses the existing RegCheck account.
- Whether Irish licence capture is wanted at all, given the format cannot be
  validated without a supplied pattern.
- The eventual Irish regulatory wording — the whole point of the configuration
  surface, but explicitly not required to ship this work.
