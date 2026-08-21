# Cash Payment Flow Implementation

## Overview
This document describes the cash/drop-in payment flow for end-users booking classes. Users can book a session and pay via QRIS or cash at the studio within a 2-minute window.

---

## Flow Diagram

```
User selects session
        │
        ▼
User chooses "Drop In" (Cash) payment method
        │
        ▼
User clicks "Process Payment"
        │
        ▼
POST /public/bookings (with JWT + API Key)
        │
        ├─► Creates booking with status: "pending_payment"
        │
        ├─► Returns: booking_id, payment_id, order_id, amount_idr
        │         qris_image_url (optional), payment_instructions
        │
        ▼
Redirect to /checkout/[id]/cash-payment?booking_id={booking_id}
        │
        ▼
Display Payment Page:
  - QRIS code (if qris_image_url provided)
  - Payment instructions
  - 2-minute countdown timer
  - Booking details (class, time, amount, order ID)
        │
        ├─► User scans QRIS / pays at studio
        │
        ├─► Backend receives payment (Midtrans webhook or manual verification)
        │
        ├─► Booking status updates to "confirmed", payment_status to "paid"
        │
        ▼
Auto-redirect to /checkout/[id]/success on confirmation
        │
        ▼
If timeout (2 min) expires:
  - Show "Payment time expired" notice
  - Booking remains "pending_payment"
  - User can still pay at studio before class
  - Manual "Check Payment Status" button to poll
```

---

## API Endpoints

### 1. Create Cash Booking
```
POST /public/bookings
Headers:
  - x-api-key: <API_KEY>
  - Authorization: Bearer <USER_JWT>
  - Content-Type: application/json

Body:
{
  "class_session_id": "uuid",
  "payment_method": "cash"
}

Response (201):
{
  "success": true,
  "data": {
    "booking_id": "uuid",
    "payment_id": "uuid",
    "order_id": "MIDTRANS_ORDER_ID",
    "amount_idr": 150000,
    "class_name": "Morning Yoga",
    "start_datetime": "2026-08-22T07:00:00.000Z",
    "booking_status": "pending_payment",
    "payment_status": "pending",
    "payment_method": "cash",
    "qris_image_url": "https://...",     // Optional
    "payment_instructions": "Pay at studio front desk",  // Optional
    "expires_at": "2026-08-21T10:32:00.000Z"  // 2 min from creation
  }
}
```

### 2. Get Booking Status (Polling)
```
GET /public/bookings/:id
Headers:
  - x-api-key: <API_KEY>
  - Authorization: Bearer <USER_JWT>

Response (200):
{
  "success": true,
  "data": {
    "booking_id": "uuid",
    "payment_id": "uuid",
    "order_id": "MIDTRANS_ORDER_ID",
    "amount_idr": 150000,
    "class_name": "Morning Yoga",
    "start_datetime": "2026-08-22T07:00:00.000Z",
    "booking_status": "confirmed",  // or "pending_payment", "cancelled"
    "payment_status": "paid",       // or "pending", "failed", "expired"
    "payment_method": "cash",
    "qris_image_url": "https://...",
    "payment_instructions": "...",
    "expires_at": "2026-08-21T10:32:00.000Z"
  }
}
```

### Status Values

| booking_status | payment_status | Meaning |
|---|---|---|
| `pending_payment` | `pending` | Initial state, waiting for payment |
| `confirmed` | `paid` | Payment received, spot secured |
| `cancelled` | `failed` | Payment failed or booking cancelled |
| `expired` | `expired` | Payment window expired |

### 3. Retry Payment (Repay)
```
POST /public/bookings/:booking_id/repay
Headers:
  - x-api-key: <API_KEY>
  - Authorization: Bearer <USER_JWT>

Rules:
- Only works while booking_status = "pending_payment" (else 409 INVALID_STATUS)
- Mints a fresh order_id (a cancelled Midtrans order can never be reopened),
  resets payment to pending, returns new snap_token + snap_redirect_url
- Old order_id is replaced on the payment row, so a late webhook for the
  dead session can't corrupt state

Response (200):
{
  "success": true,
  "data": {
    "booking_id": "uuid",
    "payment_id": "uuid",
    "order_id": "NEW_MIDTRANS_ORDER_ID",
    "amount_idr": 150000,
    "snap_token": "...",
    "snap_redirect_url": "https://app.sandbox.midtrans.com/...",
    "expires_at": "2026-08-22T10:32:00.000Z"
  }
}
```

### UI Button Logic (booking detail)

| Condition | Button |
|---|---|
| `payment.status == "pending"` | **Pay Now** → redirect to existing `snap_redirect_url` |
| `payment.status` in `cancel / expire / deny / failure` | **Retry Payment** → calls repay, redirects to new `snap_redirect_url` |
| otherwise (not cancelled) | Cancel Class |

---

## Frontend Implementation

### Files Modified/Created

1. **`src/types/customer-app/booking.interface.ts`**
   - Added `ICreatePublicBookingRequest` & `ICreatePublicBookingResponse`

2. **`src/types/customer-app/public.interface.ts`**
   - Added `IPublicBookingDetail` & `TGetPublicBookingDetail`

3. **`src/api-req/customer-app/booking.ts`**
   - Added `createPublicBooking()` - calls POST /public/bookings

4. **`src/api-req/customer-app/public.ts`**
   - Added `getPublicBookingDetail()` - calls GET /public/bookings/:id

5. **`src/hooks/api/queries/customer/public/use-get-public-booking-detail.ts`**
   - React Query hook with 3-second polling (`refetchInterval: 3000`)

6. **`src/hooks/api/mutations/customers/use-create-public-booking.ts`**
   - Mutation hook for creating cash bookings

7. **`src/view/checkout/index.tsx`**
   - Updated to redirect to cash-payment page with `booking_id` query param

8. **`src/app/(customer-app)/(checkout)/checkout/[id]/cash-payment/page.tsx`**
   - Payment page with QRIS display, countdown timer, status polling

---

## Payment Page Features

### Countdown Timer
- **Duration**: 2 minutes (120 seconds)
- **Display**: MM:SS format in red
- **On expiry**: Shows warning, stops auto-polling, enables manual check

### QRIS Display
- Shows `qris_image_url` if provided by backend
- Fallback: Shows payment instructions text if no QRIS

### Auto-Polling
- Refetches booking status every 3 seconds
- Stops when `booking_status === "confirmed"` or `payment_status === "paid"`
- Auto-redirects to success page on confirmation

### Manual Check
- "I've Completed Payment - Check Status" button
- Triggers immediate refetch
- Available even after timer expires

### Booking Details Display
- Class name
- Date & time (formatted)
- Amount (IDR formatted)
- Order ID

---

## Backend Requirements

The backend must:
1. Generate QRIS code for cash payments (optional but recommended)
2. Set `expires_at` to 2 minutes from booking creation
3. Update `booking_status` to `confirmed` and `payment_status` to `paid` when:
   - Midtrans webhook receives payment notification
   - Admin manually marks payment as received
   - Studio staff confirms cash payment
4. Handle race conditions (double booking prevention)

---

## Error Handling

| Error Code | HTTP | Frontend Action |
|---|---|---|
| `UNAUTHORIZED` | 401 | Redirect to login |
| `SESSION_FULL` | 409 | Show "Session full" toast |
| `SESSION_CANCELED` | 409 | Show "Session cancelled" toast |
| `BOOKING_CUTOFF` | 400 | Show "Booking closed" toast |
| `DUPLICATE_BOOKING` | 409 | Show "Already booked" toast |
| Network/5xx | 5xx | Show retry option |

---

## Testing Checklist

- [ ] User can select "Drop In" payment method
- [ ] Booking created with `pending_payment` status
- [ ] Redirect to cash-payment page with booking_id
- [ ] QRIS image displays (if backend provides)
- [ ] Countdown timer starts at 2:00
- [ ] Polling updates status every 3 seconds
- [ ] Auto-redirect on payment confirmation
- [ ] Timer expiry shows warning but allows manual check
- [ ] Manual "Check Payment Status" works
- [ ] Success page shows after confirmation
- [ ] Error toasts display correctly

---

## Future Enhancements

1. **WebSocket/Push Notifications** - Replace polling with real-time updates
2. **Payment Providers** - Integrate with Midtrans QRIS, Xendit, or Tripay
3. **Admin Dashboard** - Staff can mark payments as received
4. **Email/SMS Receipt** - Send confirmation after payment
5. **Partial Payments** - Support deposit + pay at studio