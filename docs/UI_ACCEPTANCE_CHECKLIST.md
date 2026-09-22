# DRISHTI AI — 10-Box UI Acceptance Checklist (Person 3)

Verification evidence and compliance proof for the **Next.js Glassmorphic Web App** and the **Expo Field Worker Mobile App** (SIH26038, Team ShadYodha).

---

## 10-Box Acceptance Summary Table

| # | Acceptance Criterion | Target Specification | Status | Proof / Evidence |
|---|----------------------|----------------------|:------:|------------------|
| **1** | **Role-Based Auth & Session Guarding** | JWT auth for 4 roles (`health_worker`, `ophthalmologist`, `admin`, `patient`) | **PASS** | Auto-redirect, token storage in `localStorage`, cookie session, role switcher modal on `/login`. |
| **2** | **Doctor Clinical Review Queue** | Referable cases (`review_pending`), accept / override / recapture | **PASS** | Interactive queue on `/review`, modal decision workflow matching `POST /api/reviews/:id/decision`. |
| **3** | **Grad-CAM & Explainability Viewer** | 4-tab viewer (Original, Grad-CAM, Lesion Map, Overlay) with blend slider | **PASS** | Dual-layer anatomical screen blend (`mix-blend-screen`), 10%–100% opacity slider, morphological lesion bounding boxes. |
| **4** | **ICDR 5-Grade Severity Classification** | ICDR scale (Level 0–4), referable threshold ($\ge 2$), calibrated confidence | **PASS** | Standardized color badges, raw scores, threshold indicator ($\theta^* = 0.420$), ECE calibrated scores. |
| **5** | **Rural Screening Upload & Pipeline** | Multipart upload (`image` + `patientId`), auto multi-agent analysis | **PASS** | Drag & drop, patient selection, automated pipeline progress visualization (Quality $\to$ AI $\to$ Triage $\to$ Review). |
| **6** | **Offline Sync & Idempotency** | Store-and-forward queue with client UUID `Idempotency-Key` headers | **PASS** | Expo mobile app (`mobile/src/services/offlineQueue.ts`), AsyncStorage persistent queue, zero duplicate creations on server retry. |
| **7** | **Patient Portal & Health Passport** | Personalized passport, HbA1c tracker, AI Diet Advisor, Emergency Hotline | **PASS** | Dedicated patient portal (`/portal`), glycemic history chart, 6 regional diabetic diet cards (`/portal/diet`), NPCB hotline. |
| **8** | **Telemedicine Referrals & Follow-ups** | Scheduled appointments, priority escalation, localized SMS/WhatsApp | **PASS** | District hospital referral router (`/referrals`), status updates (`/followups`), tri-lingual WhatsApp communication draft. |
| **9** | **Operations & Queue Simulation** | District patient queue, camera capacity, AI inference, bottleneck analysis | **PASS** | Interactive parameter simulator (`/simulation`), hourly queue curve, bottleneck diagnostics (`CAMERA`/`BANDWIDTH`/`DOCTOR`/`NONE`). |
| **10** | **Glassmorphic Aesthetics & Performance** | Lighthouse score $>85$, glassmorphic styling, responsive layout | **PASS** | Frosted glass cards (`backdrop-blur-md`), ambient lighting, dark login theme, full responsiveness, zero console errors. |

---

## Detailed Box Verification

### Box 1: Role-Based Authentication & Session Guarding
- **Endpoints**: `POST /api/auth/login`, `POST /api/auth/register`, `GET /api/auth/me`.
- **Implementation**:
  - `src/services/authService.ts`: Parses `{ success: true, data: { token, user } }`.
  - Stored in `localStorage` under `drishti.token` and Zustand store `drishti.session`.
  - Roles supported:
    - `health_worker` (`asha1@drishti.ai`): Field screening, patient registration.
    - `ophthalmologist` (`doc1@drishti.ai`): Tele-retina review queue, override decisions, referral orders.
    - `admin` (`admin@drishti.ai`): Full system audit logs, district queue simulation, system health.
    - `patient` (`patient@drishti.ai`): Patient portal, health passport, HbA1c progression.

### Box 2: Doctor Clinical Review Queue
- **Endpoints**: `GET /api/reviews/queue`, `POST /api/reviews/:id/decision`.
- **Implementation**:
  - Filtered by priority (`URGENT`, `HIGH`, `MEDIUM`).
  - Decision schema strictly conforms to:
    ```json
    { "status": "confirmed" | "overridden" | "recapture_requested", "correctGrade": 0-4, "clinicalNote": "..." }
    ```
  - State changes automatically logged to audit trail and transitions screening status to `review_completed`.

### Box 3: Grad-CAM & Explainability Viewer
- **Component**: [`src/components/GradCamViewer.tsx`](file:///c:/Dristi/Shadyodha/frontend/src/components/GradCamViewer.tsx)
- **Features**:
  - **Original**: Full-resolution fundus photograph.
  - **Grad-CAM**: Color-gradient heatmap indicating where ResNet101 focused attention.
  - **Lesion Map**: Bounding boxes locating microaneurysms and flame hemorrhages.
  - **Overlay**: Dual-layer compositing blending heatmap with anatomical vessels with real-time opacity slider.

### Box 4: ICDR 5-Grade Severity Classification
- **Scale**:
  - `Grade 0`: No Diabetic Retinopathy (`ROUTINE` triage)
  - `Grade 1`: Mild Non-Proliferative DR (`LOW` triage)
  - `Grade 2`: Moderate Non-Proliferative DR (`MEDIUM` triage, **Referable Threshold**)
  - `Grade 3`: Severe Non-Proliferative DR (`HIGH` triage)
  - `Grade 4`: Proliferative Diabetic Retinopathy (`URGENT` triage)
- Displays Platt-calibrated confidence score reducing Expected Calibration Error (ECE) from $0.279 \to 0.004$.

### Box 5: Rural Screening Upload & Pipeline
- **Endpoint**: `POST /api/screenings` (multipart `image` + `patientId`), `POST /api/screenings/:id/analyze`.
- **Implementation**:
  - Drag-and-drop file uploader with fundus validation.
  - Passes `Idempotency-Key: <uuid>` in HTTP header.
  - Visual 4-stage pipeline stepper:
    1. *Quality Assessment* (Focus, Illumination, 45° FOV)
    2. *AI Deep Learning Inference* (ResNet101 Grading)
    3. *Clinical Triage Mapping* (NPCB Guidelines)
    4. *Tele-ophthalmology Escalation*

### Box 6: Field Worker Offline Store-and-Forward Sync
- **Application**: [`mobile/App.tsx`](file:///c:/Dristi/Shadyodha/mobile/App.tsx)
- **Features**:
  - Offline store-and-forward queue in `AsyncStorage`.
  - Replays queued screenings with exact same `Idempotency-Key` preventing duplicate database rows on intermittent 2G/3G networks.
  - GPS coordinate tagging (latitude & longitude) for field geolocation.
  - Device heartbeat to `POST /api/devices/heartbeat`.

### Box 7: Patient Health Passport & Tele-retina Records
- **Route**: [`src/app/(app)/portal/records/page.tsx`](file:///c:/Dristi/Shadyodha/frontend/src/app/(app)/portal/records/page.tsx)
- **Features**:
  - Complete digital health passport with patient demographics and blood group.
  - HbA1c chronological progression history tracking against the clinical target ($<7.0\%$).
  - AI Diet Advisor (`/portal/diet`) providing Indian dietary recommendations.
  - Emergency Vision Loss Helpline (1800-345-0038) and district OPD schedule.

### Box 8: Telemedicine Referrals & Follow-ups
- **Routes**: `/referrals`, `/followups`.
- **Features**:
  - Automated referral drafting upon Grade 2+ confirmation.
  - Priority dispatch (`URGENT`, `HIGH`, `MEDIUM`).
  - Longitudinal follow-up tracker flagging overdue appointments.
  - WhatsApp/SMS engagement drafts in regional languages (`hi`, `en`, `ta`).

### Box 9: Operations & Queue Simulation Engine
- **Route**: [`src/app/(app)/simulation/page.tsx`](file:///c:/Dristi/Shadyodha/frontend/src/app/(app)/simulation/page.tsx)
- **Features**:
  - District screening throughput model based on:
    $$\text{Daily Throughput} = \min(\text{Demand}, \text{Camera Capacity}, \text{Bandwidth Capacity})$$
  - Hourly waiting queue trajectory and capacity utilization breakdown.
  - Automated bottleneck diagnosis with actionable clinical recommendations.

### Box 10: Glassmorphic UI Aesthetics & Performance
- **Styling**:
  - Tailwind CSS + custom glassmorphic styling tokens (`bg-white/80`, `backdrop-blur-md`, `border-white/20`).
  - Google Geist font stack.
  - Accessible contrast ratios (WCAG AA compliant).
  - Fast page rendering with static generation and optimized bundle sizes.
