import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Alert,
} from "react-native";
import { enqueueScreening } from "../services/offlineQueue";

const PATIENT_LIST = [
  { id: "PAT-2024-001", name: "Kamala Naik", village: "Luhagudi", age: 52, isDiabetic: true },
  { id: "PAT-2024-002", name: "Ramesh Patel", village: "Rampur", age: 58, isDiabetic: true },
  { id: "PAT-2024-003", name: "Sunita Devi", village: "Gajapati Sub-center", age: 46, isDiabetic: true },
  { id: "PAT-2024-004", name: "Bikram Behera", village: "Mohana", age: 64, isDiabetic: true },
];

export function ScreeningCaptureScreen({
  onNavigate,
  language,
}: {
  onNavigate: (screen: "home" | "capture" | "queue") => void;
  language: "en" | "hi";
}) {
  const [selectedPatient, setSelectedPatient] = useState(PATIENT_LIST[0]);
  const [captured, setCaptured] = useState(false);
  const [saving, setSaving] = useState(false);

  const t = {
    en: {
      title: "Fundus Camera Capture",
      step1: "1. Select Rural Patient",
      step2: "2. Optical Quality Checklist",
      step3: "3. Retinal Image Viewfinder",
      captureButton: "📸 Capture Retinal Fundus",
      recapture: "Re-take Scan",
      saveOffline: "Save to Offline Sync Queue",
      savedSuccess: "Screening Queued Offline",
      savedDesc: "Stored securely with UUID idempotency key. Ready for automatic cloud sync.",
      discCentering: "Macula & Optic Disc centered",
      blurCheck: "Sharp vessel bifurcations",
      glareCheck: "Minimal corneal reflex glare",
      back: "← Back",
    },
    hi: {
      title: "फंडस कैमरा स्कैन",
      step1: "१. मरीज का चयन करें",
      step2: "२. ऑप्टिकल गुणवत्ता जांच",
      step3: "३. रेटिना इमेज व्यूफ़ाइंडर",
      captureButton: "📸 रेटिना फंडस स्कैन करें",
      recapture: "पुनः स्कैन लें",
      saveOffline: "ऑफलाइन कतार में सुरक्षित करें",
      savedSuccess: "जांच ऑफलाइन कतार में दर्ज",
      savedDesc: "UUID कुंजी के साथ सुरक्षित संग्रहित। नेटवर्क मिलते ही स्वतः सिंक होगा।",
      discCentering: "ऑप्टिक डिस्क व मैकुला केंद्र में",
      blurCheck: "रक्त वाहिकाएं स्पष्ट दिख रही हैं",
      glareCheck: "न्यूनतम कॉर्निया रिफ्लेक्स",
      back: "← वापस",
    },
  }[language];

  async function handleSave() {
    setSaving(true);
    try {
      await enqueueScreening({
        patientId: selectedPatient.id,
        patientName: selectedPatient.name,
        imageUri: "https://drishti.ai/fundus-sample-od.jpg",
        fileName: `${selectedPatient.id}_OD_${Date.now()}.jpg`,
        gps: { lat: 18.8135, lng: 84.1481 }, // Paralakhemundi, Gajapati
      });
      Alert.alert(t.savedSuccess, t.savedDesc, [
        { text: "View Queue", onPress: () => onNavigate("queue") },
        { text: "Done", onPress: () => onNavigate("home") },
      ]);
    } catch {
      Alert.alert("Error", "Could not queue offline");
    } finally {
      setSaving(false);
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => onNavigate("home")} style={styles.backButton}>
            <Text style={styles.backText}>{t.back}</Text>
          </TouchableOpacity>
          <Text style={styles.title}>{t.title}</Text>
        </View>

        {/* Step 1: Patient Picker */}
        <Text style={styles.stepTitle}>{t.step1}</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.patientScroll}>
          {PATIENT_LIST.map((p) => (
            <TouchableOpacity
              key={p.id}
              style={[
                styles.patientCard,
                selectedPatient.id === p.id && styles.patientCardActive,
              ]}
              onPress={() => setSelectedPatient(p)}
            >
              <Text style={[styles.patientName, selectedPatient.id === p.id && styles.activeText]}>
                {p.name}
              </Text>
              <Text style={styles.patientSub}>{p.id} &bull; {p.age}y</Text>
              <Text style={styles.patientSub}>{p.village}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Step 2: Quality Guidelines */}
        <Text style={styles.stepTitle}>{t.step2}</Text>
        <View style={styles.checkCard}>
          <Text style={styles.checkItem}>✓ {t.discCentering}</Text>
          <Text style={styles.checkItem}>✓ {t.blurCheck}</Text>
          <Text style={styles.checkItem}>✓ {t.glareCheck}</Text>
        </View>

        {/* Step 3: Viewfinder */}
        <Text style={styles.stepTitle}>{t.step3}</Text>
        <View style={styles.viewfinder}>
          <View style={styles.reticleOuter}>
            <View style={styles.reticleInner} />
          </View>
          <Text style={styles.viewfinderText}>
            {captured ? "✓ Image Captured (45° Field of View)" : "Align optical barrel with patient's dilated pupil"}
          </Text>
          {captured && (
            <View style={styles.qualityTag}>
              <Text style={styles.qualityTagText}>Quality Score: 94% (High Confidence)</Text>
            </View>
          )}
        </View>

        {/* Actions */}
        {!captured ? (
          <TouchableOpacity style={styles.captureBtn} onPress={() => setCaptured(true)}>
            <Text style={styles.captureBtnText}>{t.captureButton}</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.buttonRow}>
            <TouchableOpacity style={styles.reBtn} onPress={() => setCaptured(false)}>
              <Text style={styles.reBtnText}>{t.recapture}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.saveBtn}
              onPress={handleSave}
              disabled={saving}
            >
              <Text style={styles.saveBtnText}>
                {saving ? "Saving..." : t.saveOffline}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0B1120" },
  scroll: { padding: 20 },
  header: { flexDirection: "row", alignItems: "center", marginBottom: 20 },
  backButton: { marginRight: 14 },
  backText: { color: "#38BDF8", fontSize: 14, fontWeight: "600" },
  title: { fontSize: 18, fontWeight: "bold", color: "#F8FAFC" },
  stepTitle: { fontSize: 13, fontWeight: "700", color: "#94A3B8", marginTop: 16, marginBottom: 8 },
  patientScroll: { flexDirection: "row", marginBottom: 12 },
  patientCard: {
    backgroundColor: "#1E293B",
    padding: 14,
    borderRadius: 14,
    marginRight: 10,
    borderWidth: 1,
    borderColor: "#334155",
    width: 150,
  },
  patientCardActive: { borderColor: "#6366F1", backgroundColor: "#312E81" },
  patientName: { color: "#F8FAFC", fontWeight: "bold", fontSize: 13 },
  activeText: { color: "#A5B4FC" },
  patientSub: { color: "#94A3B8", fontSize: 11, marginTop: 2 },
  checkCard: {
    backgroundColor: "#1E293B",
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#334155",
  },
  checkItem: { color: "#10B981", fontSize: 12, marginBottom: 4, fontWeight: "500" },
  viewfinder: {
    height: 240,
    backgroundColor: "#020617",
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#334155",
    borderStyle: "dashed",
    marginVertical: 12,
  },
  reticleOuter: {
    width: 110,
    height: 110,
    borderRadius: 55,
    borderWidth: 2,
    borderColor: "#38BDF8",
    alignItems: "center",
    justifyContent: "center",
  },
  reticleInner: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#F43F5E",
  },
  viewfinderText: { color: "#94A3B8", fontSize: 12, marginTop: 14, textAlign: "center", paddingHorizontal: 20 },
  qualityTag: {
    marginTop: 8,
    backgroundColor: "#065F46",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  qualityTagText: { color: "#34D399", fontSize: 11, fontWeight: "bold" },
  captureBtn: {
    backgroundColor: "#4F46E5",
    padding: 18,
    borderRadius: 16,
    alignItems: "center",
    marginTop: 12,
  },
  captureBtnText: { color: "#FFFFFF", fontSize: 15, fontWeight: "bold" },
  buttonRow: { flexDirection: "row", gap: 10, marginTop: 12 },
  reBtn: {
    flex: 1,
    backgroundColor: "#1E293B",
    padding: 16,
    borderRadius: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#334155",
  },
  reBtnText: { color: "#CBD5E1", fontWeight: "600" },
  saveBtn: {
    flex: 2,
    backgroundColor: "#10B981",
    padding: 16,
    borderRadius: 16,
    alignItems: "center",
  },
  saveBtnText: { color: "#FFFFFF", fontWeight: "bold" },
});
