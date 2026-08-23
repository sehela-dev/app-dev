# Docs — Last Update `c8c6ad7` (customer-app) — 2026-08-23

Branch: `dev-participants` (1 commit ahead of origin). 12 files changed, `376 insertions(+), 219 deletions(-)`.

## Summary

Migrates Drop-In payment from `POST /public/bookings` → `POST /profile/bookings` and reworks the cash-payment success host to keep the local page mounted while Midtrans opens in a new tab. Adds proper booking-status UI (pending/cancelled/confirmed) and fixes routing/scroll regressions.

## 1. API endpoint migration

All booking mutations/reads now hit authenticated ` /profile/bookings` (JWT + `x-api-key`). ` /public/bookings` is no longer used for bookings.

| Before | After | File |
|---|---|---|
| `POST /public/bookings` | `POST /profile/bookings` | `src/api-req/customer-app/booking.ts:26` (`createPublicBooking`) |
| `POST /public/bookings/:id/repay` | `POST /profile/bookings/:id/repay` | `src/api-req/customer-app/booking.ts:30` (`repayBooking`) |
| `GET /public/bookings/:id` | `GET /profile/bookings/:id` | `src/api-req/customer-app/public.ts:42` (`getPublicBookingDetail`) |

Types updated: `src/types/customer-app/booking.interface.ts:58` comment `migrated from /public/bookings`, `src/types/customer-app/public.interface.ts:165` `GET /profile/bookings/:id`, added `price_idr` to `IPublicBookingDetail:174` and booking/payment context fields to `IPublicSession:135-143`.

## 2. Checkout → cash-payment (`src/view/checkout/index.tsx:111`)

- `payment_method` changed from `"cash"` → `"midtrans"` (`src/view/checkout/index.tsx:115`).
- On success with `snap_redirect_url`: `window.open(url, "_blank")` then `router.push(/checkout/[id]/cash-payment?booking_id=...&snap_redirect_url=...)`. Popup-block fallback: cash-payment page renders a fallback button from the query param (`src/view/checkout/index.tsx:120-125`).
- Without `snap_redirect_url`: `?booking_id=` only. No booking → `/checkout/[id]/success` fallback.

## 3. Cash-payment page (`src/app/(customer-app)/(checkout)/checkout/[id]/cash-payment/page.tsx:1`)

Rewritten from polling `useGetPublicBookingDetail` to `useGetMySessionDetail(booking_id)` (`src/hooks/api/queries/customer/profile/use-get-my-session-detail.ts:5` now `string|undefined`, `enabled: !!params`, no interval).

Key behavior:
- `snapUrl = searchParams snap_redirect_url || detail.payment.snap_redirect_url` — URL param wins (`page.tsx:31`).
- Opens Midtrans **once** in new tab via `hasOpenedRef` guard (`page.tsx:38-43`). If `window.open` returns null (popup blocked), guard resets so fallback button works.
- Inline success state (no redirect to `/success`): when `booking_status==="confirmed"` or `payment.status in paid/settlement/capture` → `paymentConfirmed=true` renders `Payment Success` card with order/booking IDs (`page.tsx:61`, `page.tsx:104`).
- 2-min countdown (`PAYMENT_TIMEOUT_MS = 120000`) pauses on confirm; expiry triggers `refetch()` (`page.tsx:45-68`).
- Error state (`isError || !detail && !snapParam`) shows `Back to Booking` CTA (`page.tsx:78`).
- Billing fields: `session_name/class_name`, `start_datetime`, `total_paid_idr ?? price_idr` (`page.tsx:91-93`).

Polling removed from hook; page uses manual `Check Status` (`Button variant outline → refetch()`) + `Re-open Payment Page` (`page.tsx:276-286`).

## 4. Payment callback error route

New: `src/app/(customer-app)/payment/error/page.tsx:1` — `Suspense` wrapper around `PaymentCallbackView` (`src/view/payment-callback-view/index.tsx:1`).

`PaymentCallbackView` reads `?order_id&transaction_status`, verifies via `useGetPaymentStatus(orderId)` and maps `settlement/capture → success`, `deny/cancel/expire/failure → failed`, else pending with loader. CTAs: `View My Class` → `/profile/my-sessions`, `Back to Book` on failure/pending.

## 5. MySessionCard redesign (`src/components/general/my-session-card.tsx:1`)

- Helpers: `ensureHHmm(time):22` pads `H:m` → `HH:mm`; `FAILED_STATUSES:33` list.
- Normalised status: `normalizedBooking/Payment = toLowerCase()`; `isCancelled` covers `cancelled/canceled/expired` + `FAILED_STATUSES.includes(payment)` (`my-session-card.tsx:54`); `isPendingPayment` excludes cancelled (`my-session-card.tsx:61`); `isConfirmed` covers `confirmed/upcoming/paid/settlement/capture` (`my-session-card.tsx:63`).
- `statusMeta` drives `badgeClass/accent/timePill/icon` for 4 states (red cancelled/expired, yellow pending with pulse, brand confirmed/upcoming, gray fallback).
- Layout: `rounded-2xl border-l-4` accent card, `HH WIB` pill + `CalendarMinus` date, divider, `MapPin`/`User` rows. Pending shows full-width `Pay Now — HH:mm WIB` brand button → `/checkout/${classSessionId}/cash-payment?booking_id=${bookingId}`.

## 6. Minor fixes

- Tabs overflow: `TabsList` now `overflow-x-auto` + `[scrollbar-width:none]` and triggers `shrink-0 basis-auto whitespace-nowrap px-4 !flex-none` (`src/components/general/tabs-component.tsx:27-37`) — fixes clipped tabs on small widths.
- Header: `My Sessions` href ` /profile/sessions` → ` /profile/my-sessions` (`src/components/layout/header.tsx:55`).
- `MySessionsPage` (`src/view/profile/my-sessions/index.tsx:46`): tab switch early-returns if same value, removed stray `refetch()`; time format `H:mm` → `HH:mm` (`index.tsx:102`) for consistent `ensureHHmm`.
- `useGetMySessionDetail` polling disabled (`refetchOnWindowFocus: false`, `refetchInterval: false`) — page controls refetch explicitly.

## Routes

```
POST   /profile/bookings
POST   /profile/bookings/:bookingId/repay
GET    /profile/bookings/:id          (via getPublicBookingDetail, detail uses profile/my-sessions/:id)
GET    /profile/my-sessions/:id       (detailResp.data → booking_status, payment.status/order_id/snap_redirect_url)

Pages:
  /book
  /book/session/[id] → /checkout/[id] → /checkout/[id]/cash-payment?booking_id=&snap_redirect_url=
  /checkout/[id]/cash-payment          (inline success, no redirect)
  /payment/error?order_id=&transaction_status=  (Midtrans callback)
  /profile/my-sessions
```

## How to verify

```bash
npm run dev
# 1) /book → pick session → Drop In → Process Payment → new tab opens Midtrans, stay on cash-payment shows countdown + Check Status
# 2) Complete payment in Midtrans tab → original tab flips to Payment Success (or hit Check Status)
# 3) /profile/my-sessions → Pending shows yellow + Pay Now; Confirmed brand; Cancelled/Expired red
# 4) Tabs on /profile/my-sessions scroll horizontally without clipping
# 5) Header My Sessions navigates to /profile/my-sessions
npx tsc --noEmit
```
