# DRISHTI AI Telemedicine Simulation Module (SIH26038)

**Team:** ShadYodha  
**Target:** Rural District Screening Operational Planning & Resource Optimization

---

## 1. Architectural Overview (SimEvents / Simulink)

The telemedicine screening pipeline is modeled as a discrete-event queueing network:

```
[Entity Generator: Patient Arrivals]
                │ (Poisson Process: λ = patientsPerDay / operatingHours)
                ▼
    [Registration FIFO Queue] ──► [Registration Server: 120s]
                │
                ▼
      [Camera Queue] ──► [N Fundus Cameras: 60s/eye + 2×3MB upload via bandwidth]
                │
                ▼
        [AI Server Queue] ──► [AI Inference Engine: ~5s/case]
                │
                ▼
       [Entity Output Switch: Referable? (score >= operatingThreshold)]
       ├── Non-Referable (75%) ──► [Completed / Discharged]
       └── Referable (25%)
                │
                ▼
     [Priority Review Queue] ──► [M Doctor Review Stations: 180s/case]
                │
                ▼
     [Entity Sink / Final Tele-Consultation Completed]
```

---

## 2. Input Parameters

| Parameter | Default | Clinical / Operational Meaning |
|---|---|---|
| `patientsPerDay` | 100 | Daily target screening volume per rural camp |
| `numCameras` | 2 | Number of fundus cameras deployed |
| `aiProcessingTimeSec` | 5 | Average ResNet-101 + Grad-CAM inference duration |
| `numOphthalmologists` | 1 | Remote specialists available for tele-review |
| `reviewTimeSec` | 180 | Doctor review and annotation verification time |
| `bandwidthMbps` | 2.0 | Cellular/broadband uplink in rural clinic |
| `referableRate` | 0.25 | Proportion of cases flagged for specialist review |
| `operatingHours` | 8 | Camp working duration (seconds: 28,800) |
| `simDays` | 5 | Horizon of the discrete-event simulation |

---

## 3. Output Metrics & District Planning Indicators

The simulation calculates and exports the following metrics matching the backend `GET /api/simulation` schema:

- **Throughput:** `dailyThroughput`, `totalPatientsSimulated`
- **Wait Times:** `averageWaitTimeMin`, `medianWaitTimeMin`, `maxWaitTimeMin`, `p95WaitTimeMin`
- **Queue Lengths:** `maxQueueLength`, `referralBacklog`
- **Resource Utilization:**
  - `cameraUtilizationPct`
  - `aiUtilizationPct`
  - `doctorUtilizationPct`
- **Bottleneck Identification:** Identifies the active operational constraint (`fundus_camera`, `ai_server`, `ophthalmologist_review`, `registration`)
- **Recommendations:** Actionable clinical resource allocation advice (e.g. staggering patient arrival slots, adding 1 camera, or adding a tele-reviewer).

---

## 4. Execution

To run the simulation and generate `simulation_results.json`:
```matlab
results = run_simulation(struct('patientsPerDay', 150, 'numCameras', 3, 'numOphthalmologists', 2));
```
