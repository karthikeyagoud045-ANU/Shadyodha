"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Activity,
  Calendar,
  Clock,
  Download,
  Eye,
  FileText,
  Heart,
  Home,
  LogOut,
  Pill,
  ScanEye,
  Sparkles,
  Stethoscope,
  Utensils,
} from "lucide-react";
import { Logo } from "@/components/Logo";
import { useAuthStore } from "@/store/auth-store";
import { cn } from "@/lib/utils";

const PATIENT_NAV_ITEMS = [
  {
    href: "/portal",
    label: "Health Overview",
    icon: Home,
    exact: true,
  },
  {
    href: "/portal/diet",
    label: "AI Food & Diet Sugar Scanner",
    icon: Utensils,
    badge: "AI Vision",
    badgeColor: "bg-sky-500",
  },
  {
    href: "/portal/medicines",
    label: "Medicines & Reminders",
    icon: Pill,
    badge: "3 Active",
    badgeColor: "bg-indigo-500",
  },
  {
    href: "/portal/appointments",
    label: "Doctors & Appointments",
    icon: Calendar,
    badge: "Book",
    badgeColor: "bg-emerald-500",
  },
  {
    href: "/portal/screening",
    label: "Retinal AI Screening & PDF",
    icon: ScanEye,
    badge: "Report",
    badgeColor: "bg-purple-500",
  },
  {
    href: "/portal/records",
    label: "My Records & Clinic Info",
    icon: FileText,
  },
];

export function PatientSidebar({ drawer = false }: { drawer?: boolean }) {
  const path = usePathname();
  const router = useRouter();
  const session = useAuthStore((s) => s.session);
  const logout = useAuthStore((s) => s.logout);

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 bottom-0 z-40 h-screen w-64 flex-col justify-between overflow-y-auto bg-[#0A0E2A] text-white shadow-2xl transition-all duration-300",
        drawer ? "flex" : "hidden lg:flex"
      )}
    >
      {/* Background ambient lighting glows tailored for Patient portal */}
      <div className="pointer-events-none absolute -left-20 -top-20 h-64 w-64 rounded-full bg-sky-600/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-20 -right-20 h-64 w-64 rounded-full bg-indigo-600/20 blur-3xl" />

      {/* Top Brand Logo & Patient Portal Badge */}
      <div className="relative z-10 px-5 pt-5 pb-3">
        <Logo light />
        <div className="mt-2.5 flex items-center justify-between rounded-xl border border-sky-400/30 bg-sky-500/10 px-3 py-1.5 backdrop-blur-xs">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-sky-400 opacity-75"></span>
              <span className="relative inline-flex h-2 w-2 rounded-full bg-sky-500"></span>
            </span>
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-sky-300">
              Patient Portal
            </span>
          </div>
          <span className="rounded bg-sky-400/20 px-1.5 py-0.5 text-[9px] font-bold text-sky-200">
            DRISHTI
          </span>
        </div>
      </div>

      {/* Patient Profile Card Snippet */}
      <div className="relative z-10 px-3 py-1">
        <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-2.5">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-sky-400 to-indigo-600 text-sm font-black text-white shadow-md">
            KN
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-bold text-white">Kamala Naik</p>
            <p className="text-[10px] text-sky-300">PT-2024-001 &bull; 52F</p>
            <p className="truncate text-[9px] text-slate-400">Luhagudi, Gajapati</p>
          </div>
        </div>
      </div>

      {/* Navigation List for All Patient Features */}
      <nav className="relative z-10 flex-1 space-y-1 px-3 py-2">
        <p className="px-3 pb-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
          Patient Services
        </p>

        {PATIENT_NAV_ITEMS.map((item) => {
          const active = item.exact
            ? path === item.href
            : path === item.href || (item.href !== "/portal" && path.startsWith(item.href));
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "group relative flex items-center justify-between rounded-xl px-3 py-2.5 text-xs font-medium transition-all duration-200",
                active
                  ? "bg-gradient-to-r from-[#5B4EFF] to-[#8659F6] text-white shadow-lg shadow-indigo-500/30"
                  : "text-slate-300 hover:bg-white/5 hover:text-white"
              )}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <Icon
                  className={cn(
                    "h-4 w-4 shrink-0 transition-transform duration-200 group-hover:scale-110",
                    active ? "text-white" : "text-slate-400 group-hover:text-white"
                  )}
                />
                <span className="truncate">{item.label}</span>
              </div>

              {item.badge && (
                <span
                  className={cn(
                    "flex h-4 items-center justify-center rounded-full px-1.5 text-[9px] font-bold text-white shadow-sm shrink-0",
                    item.badgeColor || "bg-[#F43F5E]"
                  )}
                >
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bottom Visual Card: Eye Retinal Vision */}
      <div className="relative z-10 p-3 pt-1">
        <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-b from-[#111842]/90 to-[#0A0E2A]/95 p-3 text-center shadow-xl backdrop-blur-md">
          {/* Subtle glow orb */}
          <div className="pointer-events-none absolute -top-8 left-1/2 h-20 w-20 -translate-x-1/2 rounded-full bg-sky-500/25 blur-xl" />

          {/* Glowing Eye Visual */}
          <div className="relative mx-auto mb-2 flex h-9 w-9 items-center justify-center">
            <div className="relative flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-tr from-sky-400 via-indigo-500 to-purple-500 p-0.5 shadow-glow">
              <div className="flex h-full w-full items-center justify-center rounded-full bg-[#0A0E2A]">
                <Eye className="h-4 w-4 text-sky-300 animate-pulse" />
              </div>
            </div>
          </div>

          <h3 className="text-xs font-semibold tracking-tight text-white">
            Clearer Vision, Better Health
          </h3>
          <p className="mt-0.5 text-[10px] leading-tight text-slate-400">
            Control blood sugar to protect your eyes
          </p>

          <p className="mt-2 text-[10px] font-light italic text-sky-200/60">
            &ldquo;Daily care preserves sight.&rdquo;
          </p>
        </div>

        {/* User Info & Sign out link */}
        <div className="mt-2.5 flex items-center justify-between px-2 text-xs text-slate-400">
          <div className="truncate max-w-[130px]">
            <p className="truncate text-[11px] font-semibold text-slate-300">Kamala Naik</p>
            <p className="text-[9px] text-slate-500">Patient Mode</p>
          </div>
          <button
            onClick={() => {
              logout();
              router.push("/login");
            }}
            className="flex items-center gap-1 rounded-lg px-2 py-1 text-slate-400 hover:bg-white/5 hover:text-white transition-colors"
            title="Sign out of Patient Portal"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span className="text-[10px]">Exit</span>
          </button>
        </div>
      </div>
    </aside>
  );
}

export function PatientMobileNav() {
  const path = usePathname();
  const items = PATIENT_NAV_ITEMS.slice(0, 5);

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 flex border-t border-sky-100 bg-white/95 px-2 py-2 backdrop-blur-lg lg:hidden shadow-lg">
      {items.map((item) => {
        const active = item.exact
          ? path === item.href
          : path === item.href || (item.href !== "/portal" && path.startsWith(item.href));
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex flex-1 flex-col items-center gap-1 rounded-xl py-1 text-[10px] font-medium transition-colors",
              active ? "text-sky-600 font-bold" : "text-slate-500"
            )}
          >
            <Icon className={cn("h-5 w-5", active && "animate-float text-sky-600")} />
            <span className="truncate max-w-[56px] text-[9px]">{item.label.split(" ")[0]}</span>
          </Link>
        );
      })}
    </nav>
  );
}

