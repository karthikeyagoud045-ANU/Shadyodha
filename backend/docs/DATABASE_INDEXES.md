# Database Indexes

Verified from `src/models/*.js`. All indexes are created automatically by Mongoose on boot.

## screenings
- `screeningId_1` (unique) → single-screening lookup by human ID (`SCR-YYYY-XXXXX`)
- `idempotencyKey_1` (unique, sparse) → offline-sync dedup; replays return `200 + deduped:true` without re-creating
- `healthWorkerId_1_createdAt_-1` → fast "my screenings" queries (health_worker list)
- `status_1` → fast status filtering (`?status=review_pending`)
- `triage.isReferable_1_review.status_1` → fast review queue (referable + pending)

## users
- `email_1` (unique) → fast login lookup, prevents duplicate registration
- `role_1` → RBAC queries (note: add explicit index if role-filtered listing grows)

## patients
- `patientId_1` (unique) → lookup by human ID (`PAT-XXXXX`)

## referrals
- `referralId_1` (unique) → lookup by human ID (`REF-XXXXX`)

## auditlogs
- `userId_1_timestamp_-1` → user-specific audit trail, recent-first
- (recommended) `timestamp_-1` → recent activity feed; add if audit listing slows

## Verify
```js
db.screenings.getIndexes()
db.users.getIndexes()
db.auditlogs.getIndexes()
```

## modelversions
- `modelVersion_1` (unique) → card lookup by version; latest via `createdAt` sort

## patientcommunications
- `patientId_1_createdAt_-1` → patient message history, recent-first
- `screeningId_1` → comms for a screening (owner-worker filter)

## devices
- `deviceId_1` (unique) → heartbeat upsert key (one doc per field phone)
