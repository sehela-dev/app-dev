# UI Team Handoff — Sehela Customer App (Book / Session Flow)

Last updated: Aug 2026. This document covers the customer-facing booking flow that has
been implemented, the design conventions to follow, and what is still open.

---

## 1. App shell & mobile-first rules

- The customer app lives under `src/app/(customer-app)/`. Everything is **mobile-first**;
  the shell is fixed at **`max-w-[414px]`** and centered on desktop
  (`src/layout/main-layout-with-nav.tsx`) with a `bg-brand-50` background, sticky header,
  scrollable `<main>` and optional bottom nav.
- **Build at 414px first.** Full-width, stacked controls. Use `sm:` variants only for
  desktop polish.
- Pages use `font-serif` (Lora) + `text-brand-500` for the customer UI.
- Default cursor pages: `px-4` (outer wrapper), content `gap` of `4`/`6`.

## 2. Theme tokens (from `src/app/globals.css`)

| Token             | Value      | Usage                        |
| ----------------- | ---------- | ---------------------------- |
| `brand-500`       | `#337582`  | Primary (buttons, accents)   |
| `brand-50`        | `#dcf2ed`  | App shell background         |
| `brand-25`        | `#e9f8f4`  | **Card surface**             |
| `brand-00`        | `#f7fffd`  | Inputs / subtle surfaces     |
| `brand-100`       | `#bdd9da`  | Card/border lines            |
| `gray-50`         | `#ffffff`  | White (do NOT use for cards) |

### Card recipe (keep consistent everywhere)
```
rounded-xl border border-brand-100 bg-brand-25 p-4 (or p-3)
```
- Session list cards: `min-h-[150px]`, full-height time block, `hover:shadow-md`.
- Section header label style:
  `text-xs font-bold uppercase tracking-wider text-brand-500/60`.

## 3. Features built (book flow)

### `/book` — class picker → class sessions
- Class selector grid (from `GET /public/classes`).
- Sessions list per class driven by **URL search params**:
  `date`, `instructor_id`, `location_id`, `place` (format), plus a client-side free-text
  `search` (matches session name / instructor / location).
- **Collapsible filter card** `src/components/general/session-filters.tsx` (Radix
  `Collapsible`): Date picker, Format chips (All / Offline / Online), Instructor &
  Location searchable selects. Header shows an active-filter count badge + **Reset**
  (clears date + all filters and remounts the card via `key`).
- **Infinite scroll** list: `src/components/base/infinite-scroll.tsx` (IntersectionObserver
  sentinel) + `useGetPublicSessionsInfinite(...)` (react-query `useInfiniteQuery`,
  **`page_size: 4`**, next page via `pagination.has_next`). Flatten pages with
  `data.pages.flatMap(p => p.data?.[0]?.sessions ?? [])`.
- **Search** uses `SearchInput` (debounced `onSearch`); empty state differs from the
  "no sessions" state.
- Session cards `src/components/general/session-card.tsx`: light themed card, brand time
  block, title (`line-clamp-2`), location/instructor rows, seats badge, price + credit
  chip, optional Special ribbon overlay (reserves `pr-14` on title).

### `/book/session/[id]` — session detail (`src/view/book/sessions/index.tsx`)
- Fetches **`GET /public/sessions/{id}`** via `getPublicSession` /
  `useGetPublicSession(id)` (single object, `IPublicSession`).
- Cards: Date & Time (duration computed from times), Location (offline studio/address
  + "Open in Maps" from `location_maps_url`; online + meeting link from
  `meeting_link`), Instructor, Availability (X of Y booked, seats-left progress bar,
  full state), Price (cash / credit / Free), Description.
- **Badges** for level & type — see `getSessionLevelBadge` / `getSessionTypeBadge` in
  `src/utils/session-badge.ts`.
- **Sticky CTA logic**: full → **Waiting List**; logged out → **Join Now** → `/auth/login`;
  logged in → credit + cash buttons → `/checkout/[id]` with payment method pre-set via
  `usePaymentMethodCtx()` (PaymentMethodProvider).

## 4. New files added

```
src/components/base/infinite-scroll.tsx                       # sentinel infinite scroll
src/components/general/session-filters.tsx                    # collapsible unified filters
src/components/general/session-card.tsx                       # (redesigned list card)
src/utils/session-badge.ts                                    # level/type badge colors
src/api-req/customer-app/public.ts                            # + getPublicSession(id)
src/hooks/api/queries/customer/public/use-get-public-session.ts
src/hooks/api/queries/customer/public/use-get-public-sessions-infinite.ts
```

## 5. Conventions & API pattern

- API: `src/api-req/customer-app/public.ts` uses `axiosx(false)` (unauthenticated) with
  `MAIN_API_URL`. Response envelope: `{ success, data, summary?, pagination? }`.
- Queries: `src/hooks/api/queries/customer/public/` — one file per endpoint, exported from
  the folder `index.ts`. Query keys: `["customer","public",...]`.
- Auth: `useAuthMember()` from `@/context/member.ctx` → `isAuthenticated`, `isAuthReady`,
  `user`, `profile`, `logout`. AuthProvider wraps the whole customer app.
- Always gate CTAs with `isAuthReady` first to avoid flash of the wrong state.
- Badges: pass tint classes via `className` (override the `default` variant), e.g.
  `bg-violet-500/15 text-violet-800 border-violet-500/30`.

## 6. Open items / next steps

- [ ] Waiting List button has no action handler yet (design the waitlist flow/API).
- [ ] `/auth/login` does not consume a `redirect`/`return` param yet — "Join Now"
      currently loses the booking context; add return-to-session support.
- [ ] Checkout page (`/checkout/[id]`) integration is stubbed with prefilled method;
      verify it reads `session` + payment type and shows the same themed card family.
- [ ] Consider showing level/type badges on the list session cards too (helpers exist).
- [ ] Replace load-spinners with skeleton cards for a more polished mobile feel.
- [ ] Add empty/loading stories for online sessions (`meeting_link` flow) with real API.
- [ ] Currency formatting is hardcoded `id-ID` — centralize if other locales are needed.

## 7. Commands

```bash
npm run dev              # dev server
npx tsc --noEmit         # typecheck (run before shipping)
npx eslint <path>        # lint changed files
```