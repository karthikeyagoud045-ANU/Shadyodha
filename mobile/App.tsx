import React, { useState } from "react";
import { StatusBar } from "expo-status-bar";
import { HomeScreen } from "./src/screens/HomeScreen";
import { ScreeningCaptureScreen } from "./src/screens/ScreeningCaptureScreen";
import { SyncQueueScreen } from "./src/screens/SyncQueueScreen";

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<"home" | "capture" | "queue">("home");
  const [language, setLanguage] = useState<"en" | "hi">("en");

  return (
    <>
      <StatusBar style="light" />
      {currentScreen === "home" && (
        <HomeScreen
          onNavigate={setCurrentScreen}
          language={language}
          setLanguage={setLanguage}
        />
      )}
      {currentScreen === "capture" && (
        <ScreeningCaptureScreen
          onNavigate={setCurrentScreen}
          language={language}
        />
      )}
      {currentScreen === "queue" && (
        <SyncQueueScreen
          onNavigate={setCurrentScreen}
          language={language}
        />
      )}
    </>
  );
}
