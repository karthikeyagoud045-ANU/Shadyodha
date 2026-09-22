import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  SafeAreaView,
} from "react-native";
import { getOfflineQueue, getDeviceId } from "../services/offlineQueue";

export function HomeScreen({
  onNavigate,
  language,
  setLanguage,
}: {
  onNavigate: (screen: "home" | "capture" | "queue") => void;
  language: "en" | "hi";
  setLanguage: (lang: "en" | "hi") => void;
}) {
  const [stats, setStats] = useState({ total: 0, pending: 0, synced: 0 });
  const [deviceId, setDeviceId] = useState("HW-PHONE");

  useEffect(() => {
    async function load() {
      const q = await getOfflineQueue();
      const dev = await getDeviceId();
      setDeviceId(dev);
      setStats({
        total: q.length,
        pending: q.filter((i) => i.status === "queued" || i.status === "failed").length,
        synced: q.filter((i) => i.status === "synced").length,
      });
    }
    load();
  }, []);

  const t = {
    en: {
      appName: "DRISHTI AI",
      subtitle: "Rural Health Worker Mobile Portal",
      statusOnline: "Store & Forward Ready",
      deviceId: "Device ID",
      todayStats: "Today's Field Activity",
      pendingQueue: "Pending Offline Sync",
      syncedServer: "Synced to District Cloud",
      totalScreened: "Total Field Screenings",
      startScan: "New Fundus Screening",
      startScanSub: "Capture fundus photo & patient vitals",
      viewQueue: "Offline Queue & Sync",
      viewQueueSub: "Inspect pending uploads and retry",
      langSwitch: "भाषा: हिंदी",
    },
    hi: {
      appName: "दृष्टि एआई",
      subtitle: "ग्रामीण स्वास्थ्य कार्यकर्ता मोबाइल पोर्टल",
      statusOnline: "स्टोर एवं फॉरवर्ड तैयार",
      deviceId: "डिवाइस आईडी",
      todayStats: "आज की फील्ड गतिविधि",
      pendingQueue: "सिंक हेतु शेष (ऑफलाइन)",
      syncedServer: "जिला क्लाउड पर सिंक किया गया",
      totalScreened: "कुल फील्ड जांच",
      startScan: "नई रेटिना जांच शुरू करें",
      startScanSub: "फंडस फोटो एवं मरीज की जानकारी दर्ज करें",
      viewQueue: "ऑफलाइन कतार एवं सिंक",
      viewQueueSub: "लंबित अपलोड देखें एवं सिंक करें",
      langSwitch: "Language: English",
    },
  }[language];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Top Header */}
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.appTitle}>{t.appName}</Text>
            <Text style={styles.appSubtitle}>{t.subtitle}</Text>
          </View>
          <TouchableOpacity
            style={styles.langButton}
            onPress={() => setLanguage(language === "en" ? "hi" : "en")}
          >
            <Text style={styles.langButtonText}>{t.langSwitch}</Text>
          </TouchableOpacity>
        </View>

        {/* Device & Connectivity Pill */}
        <View style={styles.statusPill}>
          <View style={styles.statusDot} />
          <Text style={styles.statusText}>{t.statusOnline}</Text>
          <Text style={styles.deviceText}>&bull; {deviceId}</Text>
        </View>

        {/* Stats Grid */}
        <Text style={styles.sectionTitle}>{t.todayStats}</Text>
        <View style={styles.statsGrid}>
          <View style={[styles.statCard, { borderLeftColor: "#F59E0B" }]}>
            <Text style={styles.statNum}>{stats.pending}</Text>
            <Text style={styles.statLabel}>{t.pendingQueue}</Text>
          </View>
          <View style={[styles.statCard, { borderLeftColor: "#10B981" }]}>
            <Text style={styles.statNum}>{stats.synced}</Text>
            <Text style={styles.statLabel}>{t.syncedServer}</Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => onNavigate("capture")}
          >
            <Text style={styles.primaryButtonTitle}>📸 {t.startScan}</Text>
            <Text style={styles.primaryButtonSub}>{t.startScanSub}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => onNavigate("queue")}
          >
            <Text style={styles.secondaryButtonTitle}>🔄 {t.viewQueue}</Text>
            <Text style={styles.secondaryButtonSub}>{t.viewQueueSub}</Text>
          </TouchableOpacity>
        </View>

        {/* Info Card */}
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>💡 ASHA Worker Protocol (NPCB)</Text>
          <Text style={styles.infoDesc}>
            1. Clean camera lens with optical cloth before each capture.{"\n"}
            2. In dim lighting, capture optic disc & macula centered.{"\n"}
            3. All scans are encrypted & saved locally until network connectivity is restored.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0B1120" },
  scroll: { padding: 20 },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  appTitle: { fontSize: 24, fontWeight: "bold", color: "#F8FAFC" },
  appSubtitle: { fontSize: 12, color: "#94A3B8", marginTop: 2 },
  langButton: {
    backgroundColor: "#1E293B",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#334155",
  },
  langButtonText: { color: "#38BDF8", fontSize: 12, fontWeight: "600" },
  statusPill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1E293B",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#334155",
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#10B981",
    marginRight: 8,
  },
  statusText: { color: "#E2E8F0", fontSize: 12, fontWeight: "600" },
  deviceText: { color: "#94A3B8", fontSize: 12, marginLeft: 6 },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#CBD5E1",
    textTransform: "uppercase",
    marginBottom: 12,
    letterSpacing: 0.5,
  },
  statsGrid: { flexDirection: "row", gap: 12, marginBottom: 24 },
  statCard: {
    flex: 1,
    backgroundColor: "#1E293B",
    padding: 16,
    borderRadius: 16,
    borderLeftWidth: 4,
  },
  statNum: { fontSize: 28, fontWeight: "bold", color: "#F8FAFC" },
  statLabel: { fontSize: 11, color: "#94A3B8", marginTop: 4 },
  actions: { gap: 12, marginBottom: 24 },
  primaryButton: {
    backgroundColor: "#4F46E5",
    padding: 18,
    borderRadius: 18,
    shadowColor: "#4F46E5",
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 4,
  },
  primaryButtonTitle: { color: "#FFFFFF", fontSize: 16, fontWeight: "bold" },
  primaryButtonSub: { color: "#C7D2FE", fontSize: 12, marginTop: 4 },
  secondaryButton: {
    backgroundColor: "#1E293B",
    padding: 18,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#334155",
  },
  secondaryButtonTitle: { color: "#F8FAFC", fontSize: 16, fontWeight: "bold" },
  secondaryButtonSub: { color: "#94A3B8", fontSize: 12, marginTop: 4 },
  infoCard: {
    backgroundColor: "rgba(30, 41, 59, 0.6)",
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#334155",
  },
  infoTitle: { color: "#38BDF8", fontSize: 13, fontWeight: "bold", marginBottom: 6 },
  infoDesc: { color: "#94A3B8", fontSize: 12, lineHeight: 18 },
});
