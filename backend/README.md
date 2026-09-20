# DRISHTI AI — Backend (SIH26038, Team ShadYodha)

Explainable AI for Diabetic Retinopathy screening in rural India.
Node.js + Express + MongoDB. MATLAB AI bridged via `child_process.exec`; mock mode for frontend work.

## Quickstart

```bash
cd backend
cp .env.example .env
npm install
npm run seed   # seeds admin/workers/doctor + patients + screenings
npm run dev    # or npm start
```

Health check: `GET http://localhost:5001/api/health`

> **Port note (team-wide): backend runs on 5001, not 5000.**
> macOS AirPlay Receiver owns port 5000 by default on every Mac,
> so 5001 avoids the conflict on all teammates' machines.
> Frontend: set `NEXT_PUBLIC_API_URL=http://localhost:5001/api` in `.env.local`.

## Env

See `.env.example`. Set `USE_MOCK_AI=false` + `MATLAB_PATH` to call the real
`run_screening(imagePath, outputDir)` MATLAB function (must write `result.json`).

## Roles

- `health_worker`: patients + screenings + follow-ups
- `ophthalmologist`: review queue + decisions + referrals
- `admin`: everything incl. `/api/simulation/*`

## Key flows

1. `POST /api/patients` → `POST /api/screenings` (multipart `image` + `patientId`)
2. `POST /api/screenings/:id/analyze` → quality → mock/MATLAB AI → triage → `review_pending` (if grade ≥ 2) else `completed`
3. `GET /api/reviews/queue` → `POST /api/reviews/:id/decision` → `POST /api/referrals`

## Tests

```bash
npm test
```

Uses `mongodb-memory-server` when available, else local MongoDB.

## Testing the bridge without MATLAB

`matlab-stub/matlab` is an executable bash stub that mimics the real
`matlab -batch "run_screening(...)"` call: it writes `result.json` +
placeholder images into the output dir. Run the bridge test with:

```bash
npm test -- tests/matlabBridge.test.js
```

The test sets `USE_MOCK_AI=false` + `MATLAB_PATH=<stub>` via env override,
so the default `USE_MOCK_AI=true` is untouched. Production swap once
Person A delivers `run_screening.m`: set `MATLAB_PATH=matlab` and
`USE_MOCK_AI=false` in `.env` — no code changes needed.
