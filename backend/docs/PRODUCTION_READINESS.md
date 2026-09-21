# DRISHTI AI — Production Readiness

## Security
- ✅ JWT with 24h expiry (`JWT_EXPIRE`)
- ✅ bcrypt password hashing
- ✅ Rate limiting: 500 req/15min global, 50 req/15min on auth per IP (`src/middleware/rateLimiter.js`; production target: tighter per-route policies)
- ✅ Helmet security headers
- ✅ Bearer tokens redacted from structured logs (`src/utils/logger.js` redact)
- ✅ Secrets via `.env` only — compose uses `${VAR}` interpolation + `env_file`, never inline URIs
- ✅ Helmet security headers
- ✅ CORS restricted to frontend origin (`CORS_ORIGIN`)
- ✅ Input validation (Joi) on all mutations
- ✅ File upload validation (MIME + size, `upload.middleware.js`)
- ✅ Audit logging on all mutations (`audit` collection)
- ✅ RBAC enforced (`protect` + `authorize` on all routes)

## Reliability
- ✅ Idempotency keys for offline sync (`Idempotency-Key` header → `200 + deduped:true` on replay)
- ✅ Graceful error handling (`errorHandler` with stable `{success, error, code}` envelope)
- ✅ Health checks: `GET /api/health` (public) + `GET /api/health/extended` (admin)
- ✅ Database indexes on hot query paths (see `DATABASE_INDEXES.md`)
- ✅ Connection pooling (Mongoose default)

## Observability
- ✅ Structured JSON logging with request IDs (pino + pino-http, `X-Request-ID` header)
- ✅ Audit trail with user attribution (`GET /api/audit`, admin)
- ✅ Interactive API docs at `GET /api-docs` (Swagger UI, OpenAPI 3.0)
- ✅ Extended health dashboard (uptime, DB status, collections, memory, mockAI flag)

## Scalability
- ✅ Stateless JWT auth (horizontal scaling ready)
- ✅ MongoDB Atlas (auto-scaling)
- ✅ File storage separated from DB (`/uploads` static mount, Docker volume)
- ✅ No in-memory session state

## Deployment
- ✅ Dockerfile (`node:20-alpine`) + `docker-compose.yml` → `docker compose up`
- ✅ Docker image build verified by CI on every push (`.github/workflows/ci.yml`)
- ✅ Swagger covers all endpoints (`GET /api-docs`, 29 paths)
- ✅ Environment-specific config (`src/config/env.js`, `.env.example`)
## Clinical validation
- ✅ Model card served at `GET /api/model/metrics` (ICDR 0-4, referable 2+, PS targets sens>0.90/spec>0.85 with server-computed `targets.met`)
- ✅ Secrets in environment variables (never committed)
