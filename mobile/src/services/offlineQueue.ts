import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";
import { getApiUrl, getAuthToken, request } from "./api";

const QUEUE_STORAGE_KEY = "drishti_field_offline_queue_v1";
const DEVICE_ID_KEY = "drishti_field_device_id_v1";

export interface OfflineScreeningItem {
  id: string;
  idempotencyKey: string;
  patientId: string;
  patientName: string;
  imageUri: string;
  fileName: string;
  fileBase64?: string;
  gps?: { lat: number; lng: number };
  status: "queued" | "syncing" | "synced" | "failed";
  createdAt: string;
  syncedAt?: string;
  error?: string;
}

function generateUUID(): string {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export async function getDeviceId(): Promise<string> {
  try {
    let id = await AsyncStorage.getItem(DEVICE_ID_KEY);
    if (!id) {
      id = `HW-PHONE-${Math.floor(1000 + Math.random() * 9000)}`;
      await AsyncStorage.setItem(DEVICE_ID_KEY, id);
    }
    return id;
  } catch {
    return "HW-PHONE-001";
  }
}

export async function getOfflineQueue(): Promise<OfflineScreeningItem[]> {
  try {
    const data = await AsyncStorage.getItem(QUEUE_STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export async function saveOfflineQueue(items: OfflineScreeningItem[]): Promise<void> {
  try {
    await AsyncStorage.setItem(QUEUE_STORAGE_KEY, JSON.stringify(items));
  } catch (err) {
    console.error("Failed to save offline queue", err);
  }
}

export async function enqueueScreening(param: {
  patientId: string;
  patientName: string;
  imageUri: string;
  fileName?: string;
  gps?: { lat: number; lng: number };
}): Promise<OfflineScreeningItem> {
  const items = await getOfflineQueue();
  const newItem: OfflineScreeningItem = {
    id: generateUUID(),
    idempotencyKey: generateUUID(),
    patientId: param.patientId,
    patientName: param.patientName,
    imageUri: param.imageUri,
    fileName: param.fileName || `fundus_${Date.now()}.jpg`,
    gps: param.gps,
    status: "queued",
    createdAt: new Date().toISOString(),
  };

  items.unshift(newItem);
  await saveOfflineQueue(items);
  return newItem;
}

export async function syncSingleItem(item: OfflineScreeningItem): Promise<{ success: boolean; error?: string }> {
  try {
    const formData = new FormData();
    formData.append("patientId", item.patientId);

    // Prepare multipart file
    const fileObj: any = {
      uri: item.imageUri,
      type: "image/jpeg",
      name: item.fileName,
    };
    formData.append("image", fileObj);

    const token = getAuthToken();
    const headers: Record<string, string> = {
      "Idempotency-Key": item.idempotencyKey,
    };
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const apiUrl = getApiUrl();
    const res = await fetch(`${apiUrl}/screenings`, {
      method: "POST",
      headers,
      body: formData,
    });

    const resJson = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(resJson.error || `Upload failed with HTTP ${res.status}`);
    }

    // Auto-trigger analyze if screening was accepted
    const screeningId = resJson?.data?.screening?.screeningId || resJson?.data?.screening?._id;
    if (screeningId) {
      await fetch(`${apiUrl}/screenings/${screeningId}/analyze`, {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      }).catch(() => {
        /* background analyze */
      });
    }

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || "Network request failed" };
  }
}

export async function syncQueue(onProgress?: (synced: number, total: number) => void): Promise<{
  syncedCount: number;
  failedCount: number;
}> {
  const items = await getOfflineQueue();
  const pending = items.filter((i) => i.status === "queued" || i.status === "failed");
  let syncedCount = 0;
  let failedCount = 0;

  for (let i = 0; i < items.length; i++) {
    if (items[i].status === "queued" || items[i].status === "failed") {
      items[i].status = "syncing";
      await saveOfflineQueue([...items]);

      const res = await syncSingleItem(items[i]);
      if (res.success) {
        items[i].status = "synced";
        items[i].syncedAt = new Date().toISOString();
        items[i].error = undefined;
        syncedCount++;
      } else {
        items[i].status = "failed";
        items[i].error = res.error;
        failedCount++;
      }
      await saveOfflineQueue([...items]);
      if (onProgress) {
        onProgress(syncedCount, pending.length);
      }
    }
  }

  // Send device telemetry heartbeat
  await sendDeviceHeartbeat();

  return { syncedCount, failedCount };
}

export async function sendDeviceHeartbeat(lastGps?: { lat: number; lng: number }): Promise<void> {
  try {
    const deviceId = await getDeviceId();
    const queue = await getOfflineQueue();
    const pendingSize = queue.filter((i) => i.status === "queued" || i.status === "failed").length;

    await request("/devices/heartbeat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        deviceId,
        os: `${Platform.OS} ${Platform.Version || ""}`,
        appVersion: "1.0.0",
        offlineQueueSize: pendingSize,
        lastGps: lastGps || { lat: 19.99, lng: 73.78 },
      }),
    });
  } catch (err) {
    // Non-blocking telemetry
    console.warn("Heartbeat failed (offline or unauthenticated):", err);
  }
}
