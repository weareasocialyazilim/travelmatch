# Lovendo Non-Goals (Explicitly NOT Implemented)

## What Lovendo Does NOT Do

These features are NOT in scope and will NOT be implemented without explicit PRD revision.

### Core Exclusions

| Feature                   | Reason                      | Status          |
| ------------------------- | --------------------------- | --------------- |
| User-to-user cash out     | Regulatory/compliance       | Not implemented |
| Physical product shipping | Not an e-commerce platform  | Not implemented |
| Swipe/like matching       | Consent-first design        | Not implemented |
| AI content generation     | Human moderation only       | Not implemented |
| AI recommendation engine  | Rules over AI               | Not implemented |
| Voice/video calls         | Text-only messaging         | Not implemented |
| Trip/booking system       | Experience-only, not travel | Not implemented |
| Reservation system        | No scheduled bookings       | Not implemented |
| Crowdfunding/donations    | Not a fundraising platform  | Not implemented |
| Marketplace listings      | No product buying/selling   | Not implemented |

### Moderation Exclusions

| Feature                 | Reason                 | Status          |
| ----------------------- | ---------------------- | --------------- |
| Auto-reject based on AI | Human decision only    | Not implemented |
| AI score weighting      | Admin has final say    | Not implemented |
| Auto-flag removal       | Manual review required | Not implemented |

### Payment Exclusions

| Feature                 | Reason                 | Status          |
| ----------------------- | ---------------------- | --------------- |
| Credit card direct pay  | IAP only for purchases | Not implemented |
| PayTR consumer checkout | PayTR only for payouts | Not implemented |
| Bank transfer deposits  | Coin via IAP only      | Not implemented |

### Messaging Exclusions

| Feature        | Reason               | Status          |
| -------------- | -------------------- | --------------- |
| Voice messages | Text only            | Not implemented |
| Video messages | Text only            | Not implemented |
| Voice calls    | Not a calling app    | Not implemented |
| Video calls    | Not a video chat app | Not implemented |

## Future Consideration Process

Any item above may be reconsidered via:

1. New PRD document
2. Security review
3. Architecture revision
4. Explicit team approval

This document takes precedence over any aspirational statements in other docs.
