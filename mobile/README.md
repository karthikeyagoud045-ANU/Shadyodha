# DRISHTI AI — Expo Field Worker Mobile App (Person 3)

Lightweight, offline-first mobile application designed for **ASHA and primary health workers** screening patients for Diabetic Retinopathy in rural and remote locations across India.

---

## Key Features

1. **Store-and-Forward Offline Architecture**:
   - Rural health workers can register patients and capture retinal scans in low/zero-connectivity environments.
   - Screenings are saved locally with a cryptographically secure UUID `Idempotency-Key` and GPS coordinates.
   - Once online connectivity is restored, the queue replays requests to the backend (`POST /api/screenings`). The backend's idempotent deduplication ensures duplicate packets do not create redundant database entries.

2. **Optical Quality Pre-check Viewfinder**:
   - Visual guidance for optic disc and macula alignment (45° Field of View).
   - Real-time on-device indicators for illumination, focus blur, and corneal glare.

3. **Bilingual Rural Support (English & Hindi)**:
   - Instant 1-tap language switcher (`English` ↔ `हिंदी`) for field operators.

4. **Device Telemetry Heartbeat**:
   - Sends background device telemetry to `POST /api/devices/heartbeat` with device ID, OS version, pending queue size, and GPS coordinates.

---

## Setup & Running

### Prerequisites
- Node.js 18+ / 20+
- [Expo Go](https://expo.dev/go) app on your Android or iOS device, or an Android/iOS emulator.

### Quickstart

```bash
cd mobile
npm install

# Start the Expo development server
npx expo start
```

- Scan the QR code using the **Expo Go** app on your phone.
- Press `a` to open in Android Emulator, or `w` to open in a web browser.

---

## Backend Integration
- By default, the mobile app targets `http://localhost:5001/api` (or `http://10.0.2.2:5001/api` on Android emulator).
- All endpoints conform directly to [`backend/docs/API_CONTRACT.md`](../backend/docs/API_CONTRACT.md).
