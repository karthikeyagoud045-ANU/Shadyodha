import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  SafeAreaView,
  ActivityIndicator,
  Alert,
} from "react-native";
import {
  getOfflineQueue,
  syncQueue,
  saveOfflineQueue,
  getDeviceId,
  OfflineScreeningItem,
} from "../services/offlineQueue";

export function SyncQueueScreen({
  onNavigate,
  language,
}: {
  onNavigate: (screen: "home" | "capture" | "queue") => void;
  language: "en" | "hi";
}) {
  const [queue, setQueue] = useState<OfflineScreeningItem[]>([]);
  const [syncing, setSyncing] = useState(false);
  const [deviceId, setDeviceId] = useState("");

  const t = {
    en: {
      title: "Store & Forward Sync Queue",
      back: "← Back",
      syncNow: "Sync All Pending",
      syncing: "Syncing Screenings...",
      clearSynced: "Clear Synced",
      empty: "Offline queue is empty. Ready for field screenings.",
      idempotencyKey: "Idempotency Key",
      statusQueued: "Pending Sync",
      statusSynced: "Synced to Cloud",
      statusFailed: "Sync Failed (Will Retry)",
      statusSyncing: "Uploading...",
      deviceTelemetry: "Device Node",
    },
    hi: {
      title: "स्टोर एवं फॉरवर्ड सिंक कतार",
      back: "← वापस",
      syncNow: "सभी लंबित सिंक करें",
      syncing: "सिंक हो रहा है...",
      clearSynced: "सिंक किए गए हटाएं",
      empty: "कतार खाली है। नई जांच दर्ज करें।",
      idempotencyKey: "आइडमपोटेंसी कुंजी (UUID)",
      statusQueued: "सिंक हेतु प्रतीक्षारत",
      statusSynced: "सफलतापूर्वक सिंक हुआ",
      statusFailed: "सिंक असफल (पुनः प्रयास होगा)",
      statusSyncing: "अपलोड हो रहा है...",
      deviceTelemetry: "डिवाइस नोड",
    },
  }[language];

  async function loadData() {
    const q = await getOfflineQueue();
    const dev = await getDeviceId();
    setQueue(q);
    setDeviceId(dev);
  }

  useEffect(() => {
    loadData();
  }, []);

  async function handleSyncAll() {
    setSyncing(true);
    try {
      const { syncedCount, failedCount } = await syncQueue();
      await loadData();
      Alert.alert(
        "Sync Complete",
        `Successfully synced ${syncedCount} screenings.${
          failedCount > 0 ? ` ${failedCount} items pending retry.` : ""
        }`,
      );
    } catch {
      Alert.alert("Sync Error", "Could not reach tele-retina server.");
    } finally {
      setSyncing(false);
    }
  }

  async function handleClearSynced() {
    const remaining = queue.filter((i) => i.status !== "synced");
    await saveOfflineQueue(remaining);
    setQueue(remaining);
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.inner}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => onNavigate("home")} style={styles.backBtn}>
            <Text style={styles.backText}>{t.back}</Text>
          </TouchableOpacity>
          <View>
            <Text style={styles.title}>{t.title}</Text>
            <Text style={styles.subTitle}>{t.deviceTelemetry}: {deviceId}</Text>
          </View>
        </View>

        {/* Action Bar */}
        <View style={styles.actionRow}>
          <TouchableOpacity
            style={[styles.syncBtn, syncing && styles.syncBtnDisabled]}
            onPress={handleSyncAll}
            disabled={syncing}
          >
            {syncing ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <Text style={styles.syncBtnText}>⚡ {t.syncNow}</Text>
            )}
          </TouchableOpacity>

          {queue.some((i) => i.status === "synced") && (
            <TouchableOpacity style={styles.clearBtn} onPress={handleClearSynced}>
              <Text style={styles.clearBtnText}>{t.clearSynced}</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Queue List */}
        {queue.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyIcon}>📦</Text>
            <Text style={styles.emptyText}>{t.empty}</Text>
          </View>
        ) : (
          <FlatList
            data={queue}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.list}
            renderItem={({ item }) => {
              const badgeStyle =
                item.status === "synced"
                  ? styles.badgeSynced
                  : item.status === "failed"
                  ? styles.badgeFailed
                  : styles.badgeQueued;

              const label =
                item.status === "synced"
                  ? t.statusSynced
                  : item.status === "failed"
                  ? t.statusFailed
                  : item.status === "syncing"
                  ? t.statusSyncing
                  : t.statusQueued;

              return (
                <View style={styles.queueCard}>
                  <View style={styles.cardHeader}>
                    <View>
                      <Text style={styles.patientName}>{item.patientName}</Text>
                      <Text style={styles.patientId}>{item.patientId}</Text>
                    </View>
                    <View style={[styles.badge, badgeStyle]}>
                      <Text style={styles.badgeText}>{label}</Text>
                    </View>
                  </View>

                  <View style={styles.metaRow}>
                    <Text style={styles.metaLabel}>{t.idempotencyKey}:</Text>
                    <Text style={styles.metaValue} numberOfLines={1}>
                      {item.idempotencyKey}
                    </Text>
                  </View>

                  {item.gps && (
                    <Text style={styles.gpsText}>
                      📍 GPS: {item.gps.lat.toFixed(4)}°N, {item.gps.lng.toFixed(4)}°E
                    </Text>
                  )}

                  <Text style={styles.dateText}>
                    Captured: {new Date(item.createdAt).toLocaleTimeString()} &bull; {new Date(item.createdAt).toLocaleDateString()}
                  </Text>
                  {item.error && <Text style={styles.errorText}>Error: {item.error}</Text>}
                </View>
              );
            }}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0B1120" },
  inner: { flex: 1, padding: 20 },
  header: { flexDirection: "row", alignItems: "center", marginBottom: 16 },
  backBtn: { marginRight: 14 },
  backText: { color: "#38BDF8", fontSize: 14, fontWeight: "600" },
  title: { fontSize: 18, fontWeight: "bold", color: "#F8FAFC" },
  subTitle: { fontSize: 11, color: "#94A3B8", marginTop: 2 },
  actionRow: { flexDirection: "row", gap: 10, marginBottom: 16 },
  syncBtn: {
    flex: 1,
    backgroundColor: "#4F46E5",
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
  },
  syncBtnDisabled: { opacity: 0.6 },
  syncBtnText: { color: "#FFFFFF", fontWeight: "bold", fontSize: 14 },
  clearBtn: {
    backgroundColor: "#1E293B",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#334155",
    alignItems: "center",
  },
  clearBtnText: { color: "#94A3B8", fontSize: 13, fontWeight: "600" },
  list: { paddingBottom: 20 },
  queueCard: {
    backgroundColor: "#1E293B",
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#334155",
  },
  cardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 },
  patientName: { color: "#F8FAFC", fontSize: 15, fontWeight: "bold" },
  patientId: { color: "#818CF8", fontSize: 12, fontWeight: "600", marginTop: 1 },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  badgeQueued: { backgroundColor: "#854D0E" },
  badgeSynced: { backgroundColor: "#065F46" },
  badgeFailed: { backgroundColor: "#991B1B" },
  badgeText: { color: "#FFFFFF", fontSize: 11, fontWeight: "bold" },
  metaRow: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: 6 },
  metaLabel: { color: "#64748B", fontSize: 11 },
  metaValue: { color: "#94A3B8", fontSize: 11, fontFamily: "monospace", flex: 1 },
  gpsText: { color: "#94A3B8", fontSize: 11, marginTop: 4 },
  dateText: { color: "#64748B", fontSize: 10, marginTop: 6 },
  errorText: { color: "#F87171", fontSize: 11, marginTop: 4 },
  emptyCard: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 30,
  },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  emptyText: { color: "#94A3B8", fontSize: 14, textAlign: "center", lineHeight: 20 },
});
