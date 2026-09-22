"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Header, MobileNav, Sidebar } from "./AppChrome";
import { PatientHeader } from "./PatientHeader";
import { PatientMobileNav, PatientSidebar } from "./PatientSidebar";
import { OfflineBanner } from "@/components/OfflineBanner";
import { useAuthStore } from "@/store/auth-store";
import { useUiStore } from "@/store/ui-store";
import { DemoRail } from "@/components/DemoRail";
import { cn } from "@/lib/utils";

export function AppShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const path = usePathname();
  const session = useAuthStore((s) => s.session);
  const sidebarOpen = useUiStore((s) => s.sidebarOpen);
  const setSidebarOpen = useUiStore((s) => s.setSidebarOpen);

  const isPatientPortal = session?.user.role === "patient" || path.startsWith("/portal");

  useEffect(() => {
    if (!session) {
      router.replace("/login");
      return;
    }

    // Role protection: If logged in as patient and not on a /portal page, redirect to /portal
    if (session.user.role === "patient" && !path.startsWith("/portal")) {
      router.replace("/portal");
    }
  }, [session, path, router]);

  if (!session) return null;

  return (
    <div className="relative min-h-screen bg-[#EFF3FD] text-slate-800 selection:bg-indigo-500 selection:text-white">
      {/* Background ambient eye image from doctor portal covering all pages */}
      <div
        className="pointer-events-none fixed inset-0 z-0 bg-[url('/drishti_hero_bg.jpg')] bg-cover bg-top bg-no-repeat opacity-40 mix-blend-multiply"
        aria-hidden
      />
      {/* Vibrant glowing gradient orbs to banish dullness across all portals */}
      <div className="pointer-events-none fixed -left-20 -top-20 z-0 h-96 w-96 rounded-full bg-cyan-400/25 blur-3xl" aria-hidden />
      <div className="pointer-events-none fixed right-10 top-1/4 z-0 h-80 w-80 rounded-full bg-indigo-500/25 blur-3xl" aria-hidden />
      <div className="pointer-events-none fixed -bottom-20 right-1/3 z-0 h-96 w-96 rounded-full bg-purple-500/20 blur-3xl" aria-hidden />

      {/* Vibrant top ambient fluid gradient */}
      <div
        className={cn(
          "pointer-events-none fixed inset-x-0 top-0 h-[450px] blur-2xl",
          isPatientPortal
            ? "bg-gradient-to-b from-sky-300/40 via-indigo-200/30 to-transparent"
            : "bg-gradient-to-b from-indigo-300/45 via-purple-200/35 to-transparent"
        )}
        aria-hidden
      />

      {/* Permanently Fixed Left Navigation Bar */}
      {isPatientPortal ? <PatientSidebar /> : <Sidebar />}

      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            className="absolute inset-0 bg-black/40 backdrop-blur-xs"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close"
          />
          <div className={cn("relative h-full w-64", isPatientPortal ? "bg-[#0A0E2A]" : "bg-[#090C22]")}>
            {isPatientPortal ? <PatientSidebar drawer /> : <Sidebar drawer />}
          </div>
        </div>
      )}

      {/* Main Content Area - padded left by 64 (16rem) so sidebar stays fixed beside it */}
      <div className="relative z-10 flex min-h-screen flex-col lg:pl-64">
        <OfflineBanner />
        {isPatientPortal ? <PatientHeader /> : <Header />}
        <main className={cn("flex-1 px-4 py-6 md:px-8", "pb-24 lg:pb-8")}>
          {children}
        </main>
        {isPatientPortal ? <PatientMobileNav /> : <MobileNav />}
      </div>
      <DemoRail path={path} />
    </div>
  );
}
