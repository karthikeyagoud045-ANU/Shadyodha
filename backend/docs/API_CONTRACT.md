# DRISHTI AI — API Contract (for Person C / Frontend)

- **Base URL:** `http://localhost:5001/api` (team-wide port; macOS AirPlay owns 5000)
  - Frontend `.env.local`: `NEXT_PUBLIC_API_URL=http://localhost:5001/api`
- **Auth:** `Authorization: Bearer <JWT>` on every route except
  `GET /api/health`, `POST /api/auth/register`, `POST /api/auth/login`.
- **Roles:** `health_worker` | `ophthalmologist` | `admin`
- **Success envelope:** `{ "success": true, "data": {...}, "message?": "..." }`
- **Error envelope:** `{ "success": false, "error": "...", "code": "..." }`
  - Codes: `AUTH_FAILED` (401), `FORBIDDEN` (403), `NOT_FOUND` (404),
    `VALIDATION_ERROR` (400, + `details: [{field, message}]`),
    `UPLOAD_ERROR` (400), `AI_PROCESSING_ERROR` (500), `STATE_ERROR` (400),
    `DUPLICATE_KEY` (409), `RATE_LIMITED` (429).
- **IDs:** endpoints accept either Mongo `_id` or human IDs
  (`PAT-XXXXX`, `SCR-YYYY-XXXXX`) wherever an `:id` appears.
- **Passwords are never returned.** File paths in DB are relative
  (`uploads/original/<uuid>.jpg`).

## Auth

### POST /api/auth/register (public)
```json
{ "name": "ASHA Worker 1", "email": "asha1@drishti.ai", "password": "Worker@123", "role": "health_worker" }
```
→ `201 { "success": true, "data": { "token": "<JWT>", "user": { "_id": "...", "name": "...", "email": "...", "role": "health_worker" } } }`

### POST /api/auth/login (public)
```json
{ "email": "asha1@drishti.ai", "password": "Worker@123" }
```
→ `200` same shape as register. Wrong credentials → `401 { "success": false, "error": "Invalid email or password", "code": "AUTH_FAILED" }`

### GET /api/auth/me (any auth)
→ `200 { "success": true, "data": { "user": {...} } }`

## Patients

### POST /api/patients (health_worker, admin)
```json
{ "name": "Ramesh Patel", "age": 58, "gender": "male", "phone": "9111111111", "village": "Rampur", "district": "Nashik", "isDiabetic": true, "diabetesDurationYears": 8 }
```
→ `201 { "data": { "patient": { "_id": "...", "patientId": "PAT-48210", ... } } }`

### GET /api/patients?search=&limit=20&page=1 (health_worker, ophthalmologist, admin)
→ `200 { "data": { "patients": [...], "total": 5, "page": 1, "limit": 20 } }`

### GET /api/patients/:id (any auth) → `200 { "data": { "patient": {...} } }`, unknown → `404 NOT_FOUND`

### PATCH /api/patients/:id (health_worker, admin) — partial body, ≥1 field.

## Screenings (multipart: field `image` + text field `patientId`)

### POST /api/screenings (health_worker, admin)
```bash
curl -X POST localhost:5001/api/screenings \
  -H "Authorization: Bearer $TOKEN" \
  -F "image=@fundus.jpg" -F "patientId=<mongo _id or PAT-XXXXX>"
```
→ `201 { "data": { "screening": { "_id": "...", "screeningId": "SCR-2026-12345", "status": "image_uploaded", ... } } }`
No file → `400 UPLOAD_ERROR`. Non-image → `400 UPLOAD_ERROR`.

**Offline-sync idempotency:** send `Idempotency-Key: <client-uuid>` with the
upload (Person C's offline queue replays with the same key after reconnect).
First upload → `201`; replay with the same key → `200 { "data": { "screening": {...same doc...}, "deduped": true } }`, no re-create.

### GET /api/screenings?status=&limit=&page= (any auth; health_worker sees own only)

### GET /api/screenings/:id (any auth)

### POST /api/screenings/:id/analyze (health_worker, admin)
Runs quality → AI → triage. Mock mode (~2s) returns grade 2.
→ `200 { "data": { "screening": { "status": "review_pending", ... } } }`

### GET /api/screenings/:id/result (any auth)
→ `200 { "data": { "aiResult": {...}, "explainability": {...}, "triage": {...}, "qualityAssessment": {...}, "status": "..." } }`

### GET /api/screenings/:id/report (owner health_worker, ophthalmologist, admin; other workers → `403 FORBIDDEN`)
Structured clinical report JSON:
```json
{
  "success": true,
  "data": {
    "report": {
      "screeningId": "SCR-2026-57085",
      "status": "referred",
      "patient": { "patientId": "PAT-96334", "name": "Demo Judge", "age": 60, "gender": "male", "village": "Rampur", "district": "Nashik" },
      "qualityAssessment": { "gradable": true, "score": 0.86, "...": "..." },
      "prediction": { "grade": 2, "label": "Moderate NPDR", "confidence": 0.87, "referable": true, "...": "..." },
      "explainability": {
        "lesionCounts": [{ "type": "microaneurysm", "count": 42 }, { "type": "hemorrhage", "count": 15 }],
        "imageUrls": {
          "gradcam": "/uploads/results/SCR-2026-57085/gradcam.png",
          "overlay": "/uploads/results/SCR-2026-57085/overlay.png",
          "annotation": "/uploads/results/SCR-2026-57085/lesion_annotation.png"
        }
      },
      "triage": { "priority": "MEDIUM", "isReferable": true, "...": "..." },
      "review": { "status": "confirmed", "clinicalNote": "...", "reviewedAt": "..." },
      "referral": { "referralId": "REF-87864", "priority": "HIGH", "referredTo": "District Hospital, Nashik", "status": "pending", "scheduledDate": null },
      "generatedAt": "2026-09-20T13:30:00.000Z",
      "disclaimer": "AI screening aid - final clinical decision rests with the ophthalmologist."
    }
  }
}
```
`referral` is `null` when no referral exists yet. Prefix `imageUrls` with `http://localhost:5001` to fetch.

## Reviews (ophthalmologist, admin)

### GET /api/reviews/queue → `200 { "data": { "screenings": [...] } }` (status `review_pending`, referable)

### GET /api/reviews/:id → single case with patient populated.

### POST /api/reviews/:id/decision
```json
{ "status": "confirmed", "clinicalNote": "Moderate NPDR confirmed" }
```
`status`: `confirmed` | `overridden` (+ required `correctGrade` 0–4) | `recapture_requested`.
Wrong state (not `review_pending`) → `400 STATE_ERROR`.

## Referrals (ophthalmologist, admin)

### POST /api/referrals
```json
{ "screeningId": "<_id or SCR-...>", "priority": "HIGH", "referredTo": "District Hospital, Nashik", "scheduledDate": "2026-10-01", "notes": "..." }
```
→ `201 { "data": { "referral": { "referralId": "REF-12345", "status": "pending", ... } } }`

### GET /api/referrals?status= → list. ### PATCH /api/referrals/:id — `status` (`pending|scheduled|completed|missed`), `scheduledDate`, `completedDate`, `notes`.

## Follow-ups (create: health_worker, ophthalmologist, admin; list/update: any auth)

### POST /api/followups
```json
{ "screeningId": "<_id>", "nextDate": "2026-10-20", "notes": "Annual review" }
```
`patientId` may be given instead of `screeningId`. → `201 { "data": { "followup": {...} } }`

### GET /api/followups?status= — past-due `scheduled` items surface as `overdue`.
### PATCH /api/followups/:id — `status` (`scheduled|completed|overdue|missed`), `nextDate`, `notes`, `completedDate`.

## Dashboard

### GET /api/dashboard/stats (any auth)
→ `{ "data": { "stats": { "totalScreenings": 3, "totalPatients": 5, "pendingReviews": 1, "totalReferrals": 0, "statusBreakdown": {...}, "gradeDistribution": [...] } } }`

### GET /api/dashboard/priority (ophthalmologist, admin) → `{ "data": { "cases": [...] } }`

## Simulation (admin)

### POST /api/simulation/run
```json
{ "patientsPerDay": 100, "numCameras": 2, "aiProcessingTimeSec": 5, "numOphthalmologists": 1, "reviewTimeSec": 120, "bandwidthMbps": 10, "referableRate": 0.2 }
```
→ `{ "data": { "results": { "dailyThroughput": 0, "averageWaitTimeMin": 0, "maxQueueLength": 0, "aiUtilizationPct": 0, "doctorUtilizationPct": 0, "referralBacklog": 0, "bottleneck": "CAMERA|BANDWIDTH|DOCTOR|NONE" }, "runId": "..." } }`

### GET /api/simulation/results → `{ "data": { "latest": {...}, "runs": [...] } }`

## Audit (admin only)

### GET /api/audit?limit=20&offset=0
→ `200 { "data": { "logs": [{ "_id": "...", "userId": { "_id": "...", "name": "ASHA Worker 1", "role": "health_worker" }, "action": "SCREENING_CREATED", "resourceType": "Screening", "resourceId": "...", "ipAddress": "::1", "timestamp": "..." }], "total": 42, "limit": 20, "offset": 0 } }`
Actions logged: `USER_REGISTER`, `USER_LOGIN`, `SCREENING_CREATED`,
`SCREENING_ANALYZED`, `REVIEW_DECISION`, `REFERRAL_CREATED`, `FOLLOWUP_CREATED`.
Non-admin → `403 FORBIDDEN`.

## Health

### GET /api/health (public) → `200 { "success": true, "data": { "status": "ok", "service": "drishti-ai-backend", "time": "..." } }`

## AI result shape (mock mode — identical keys in production)

```json
{
  "aiResult": { "grade": 2, "label": "Moderate NPDR", "confidence": 0.87, "calibratedConfidence": 0.84, "referable": true, "rawScores": [0.02, 0.05, 0.87, 0.04, 0.02], "modelVersion": "drishti-resnet101-v1", "processingTimeMs": 4200 },
  "explainability": { "gradcamUrl": "gradcam.png", "overlayUrl": "overlay.png", "annotationUrl": "lesion_annotation.png",
    "detectedLesions": [{ "type": "microaneurysm", "count": 42, "regions": [{ "x": 120, "y": 200, "w": 15, "h": 15 }] }] },
  "triage": { "priority": "MEDIUM", "action": "OPHTHALMOLOGIST_REVIEW", "isReferable": true, "recommendedTimeline": "Ophthalmologist review within 7 days" }
}
```
Note: the pipeline recomputes triage deterministically from `grade`
(see map below) — the `triage` block inside `mocks/mockAIResult.json`
is illustrative and is overridden at analyze time.

**Image URL convention:** served from backend — prefix paths with the API host:
`http://localhost:5001/uploads/results/<screeningId>/gradcam.png`
(also `overlay.png`, `lesion_annotation.png`; originals under `/uploads/original/<uuid>.jpg`).
Grade → triage map: `0 ROUTINE` · `1 LOW` · `2 MEDIUM` · `3 HIGH` · `4 URGENT`; referable ⇔ grade ≥ 2.
