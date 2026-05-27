# Security Specification

## Data Invariants
1. `users` documents can only be created or modified by the user matching the document ID (`uid`), or an admin.
2. `bookings` can be created by a user, providing their own `customerId`.
3. `bookings` status can be updated. Since the Rider app is not available here, we allow the customer to update their own booking (e.g. canceling, or simulating rider actions for the demo).

## "Dirty Dozen" Payloads
(Will be tested via firestore rules test)

## Testing
We will test locally or generate the rules to be tight according to the skill instructions.
