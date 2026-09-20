#!/usr/bin/env bash
# Judge-demo rehearsal: full DRISHTI flow against localhost:5001 via curl.
# Requires: seeded Atlas DB (npm run seed), server running (npm run dev).
# Fails fast on any non-2xx response.
# ponytail: linear curl script, no framework needed for a rehearsal.
set -euo pipefail

API="${API:-http://localhost:5001/api}"
FIXTURE="$(cd "$(dirname "$0")/.." && pwd)/tests/fixtures/fundus.jpg"

jget() { node -e "let d='';process.stdin.on('data',c=>d+=c).on('end',()=>{try{console.log(process.argv[1].split('.').reduce((o,k)=>o[k],JSON.parse(d)))}catch(e){console.error('BAD JSON: '+d);process.exit(1)}})" "$1"; }

call() { # method path [token] [extra curl args...] -> prints body, sets HTTP_CODE
  local method="$1" path="$2" token="${3:-}" ; if [ $# -ge 3 ]; then shift 3; else shift $#; fi
  local args=(-s -w '\n%{http_code}' -X "$method" "$API$path")
  [ -n "$token" ] && args+=(-H "Authorization: Bearer $token")
  local out body
  out=$(curl "${args[@]}" "$@")
  HTTP_CODE=$(echo "$out" | tail -n1)
  body=$(echo "$out" | sed '$d')
  case "$HTTP_CODE" in
    2*) echo "$body" ;;
    *) echo "FAIL $method $path -> HTTP $HTTP_CODE: $body" >&2; exit 1 ;;
  esac
}

step() { echo; echo "=== STEP $1: $2 ==="; }

step 0 "health check"
call GET /health | jget data.status

step 1 "login asha1 (health_worker)"
ASHA=$(call POST /auth/login "" -H 'Content-Type: application/json' -d '{"email":"asha1@drishti.ai","password":"Worker@123"}')
ASHA_TOK=$(echo "$ASHA" | jget data.token)
echo "token acquired"

step 2 "create patient"
PAT=$(call POST /patients "$ASHA_TOK" -H 'Content-Type: application/json' -d '{"name":"Demo Judge","age":60,"gender":"male","village":"Rampur","district":"Nashik","isDiabetic":true,"diabetesDurationYears":9}')
PID=$(echo "$PAT" | jget data.patient._id)
echo "patient _id=$PID ($(echo "$PAT" | jget data.patient.patientId))"

step 3 "upload screening"
SCR=$(call POST /screenings "$ASHA_TOK" -F "image=@$FIXTURE" -F "patientId=$PID")
SID=$(echo "$SCR" | jget data.screening._id)
echo "screening _id=$SID ($(echo "$SCR" | jget data.screening.screeningId))"

step 4 "analyze (mock AI)"
ANZ=$(call POST "/screenings/$SID/analyze" "$ASHA_TOK")
STATUS=$(echo "$ANZ" | jget data.screening.status)
[ "$STATUS" = "review_pending" ] || { echo "FAIL: expected review_pending, got $STATUS" >&2; exit 1; }
echo "status=$STATUS grade=$(echo "$ANZ" | jget data.screening.aiResult.grade) priority=$(echo "$ANZ" | jget data.screening.triage.priority)"

step 5 "fetch result"
call GET "/screenings/$SID/result" "$ASHA_TOK" | jget data.aiResult.label

step 6 "login dr.sharma (ophthalmologist)"
DOC=$(call POST /auth/login "" -H 'Content-Type: application/json' -d '{"email":"dr.sharma@drishti.ai","password":"Doctor@123"}')
DOC_TOK=$(echo "$DOC" | jget data.token)

step 7 "review queue"
Q=$(call GET /reviews/queue "$DOC_TOK")
echo "queued cases: $(echo "$Q" | node -e "let d='';process.stdin.on('data',c=>d+=c).on('end',()=>console.log(JSON.parse(d).data.screenings.length))")"

step 8 "confirm decision"
call POST "/reviews/$SID/decision" "$DOC_TOK" -H 'Content-Type: application/json' -d '{"status":"confirmed","clinicalNote":"Demo: Moderate NPDR confirmed"}' | jget data.screening.status

step 9 "create referral"
REF=$(call POST /referrals "$DOC_TOK" -H 'Content-Type: application/json' -d "{\"screeningId\":\"$SID\",\"priority\":\"HIGH\",\"referredTo\":\"District Hospital, Nashik\",\"notes\":\"Demo referral\"}")
echo "referral $(echo "$REF" | jget data.referral.referralId)"

step 10 "schedule follow-up"
NEXT=$(node -e "console.log(new Date(Date.now()+30*864e5).toISOString())")
call POST /followups "$DOC_TOK" -H 'Content-Type: application/json' -d "{\"screeningId\":\"$SID\",\"nextDate\":\"$NEXT\",\"notes\":\"Demo follow-up\"}" | jget data.followup.status

step 11 "login admin + dashboard stats"
ADM=$(call POST /auth/login "" -H 'Content-Type: application/json' -d '{"email":"admin@drishti.ai","password":"Admin@123"}')
ADM_TOK=$(echo "$ADM" | jget data.token)
STATS=$(call GET /dashboard/stats "$ADM_TOK")
echo "totalScreenings=$(echo "$STATS" | jget data.stats.totalScreenings) pendingReviews=$(echo "$STATS" | jget data.stats.pendingReviews)"

echo; echo "DEMO FLOW PASSED"
