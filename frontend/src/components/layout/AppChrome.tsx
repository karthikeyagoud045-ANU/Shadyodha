"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import {
  Activity,
  BarChart3,
  Bell,
  Calendar,
  CalendarCheck,
  ChevronDown,
  ClipboardCheck,
  FlaskConical,
  Home,
  LogOut,
  Plus,
  ScanEye,
  Search,
  Send,
  Settings,
  Sun,
  Users,
} from "lucide-react";
import { Logo } from "@/components/Logo";
import { useAuthStore } from "@/store/auth-store";
import { useOfflineStore } from "@/store/offline-store";
import { useUiStore } from "@/store/ui-store";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: Home },
  { href: "/patients", label: "Patients", icon: Users },
  { href: "/screening/new", label: "New Screening", icon: ScanEye },
  { href: "/screenings", label: "Screening Results", icon: Activity },
  { href: "/review", label: "Review Queue", icon: ClipboardCheck, badge: "12" },
  { href: "/referrals", label: "Referrals", icon: Send },
  { href: "/followups", label: "Follow-ups", icon: CalendarCheck },
  { href: "/simulation", label: "Simulation", icon: FlaskConical },
  { href: "/reports", label: "Reports", icon: BarChart3 },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function Sidebar({ drawer = false }: { drawer?: boolean }) {
  const path = usePathname();
  const router = useRouter();
  const session = useAuthStore((s) => s.session);
  const logout = useAuthStore((s) => s.logout);

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 bottom-0 z-40 h-screen w-64 flex-col justify-between overflow-y-auto bg-[#090C22] text-white shadow-2xl transition-all duration-300",
        drawer ? "flex" : "hidden lg:flex"
      )}
    >
      {/* Background ambient lighting glows */}
      <div className="pointer-events-none absolute -left-20 -top-20 h-64 w-64 rounded-full bg-indigo-600/15 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-20 -right-20 h-64 w-64 rounded-full bg-purple-600/20 blur-3xl" />

      {/* Top Brand Logo */}
      <div className="relative z-10 px-5 pt-5 pb-3">
        <Logo light />
      </div>

      {/* Navigation List */}
      <nav className="relative z-10 flex-1 space-y-1 px-3 py-1">
        {NAV_ITEMS.map((item) => {
          const active =
            path === item.href ||
            (item.href !== "/dashboard" && path.startsWith(item.href));
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "group relative flex items-center justify-between rounded-xl px-3 py-2 text-xs font-medium transition-all duration-200",
                active
                  ? "bg-gradient-to-r from-[#5B4EFF] to-[#8659F6] text-white shadow-lg shadow-indigo-500/30"
                  : "text-slate-300 hover:bg-white/5 hover:text-white"
              )}
            >
              <div className="flex items-center gap-2.5">
                <Icon
                  className={cn(
                    "h-4 w-4 transition-transform duration-200 group-hover:scale-110",
                    active ? "text-white" : "text-slate-400 group-hover:text-white"
                  )}
                />
                <span>{item.label}</span>
              </div>

              {item.badge && (
                <span className="flex h-4.5 items-center justify-center rounded-full bg-[#F43F5E] px-1.5 text-[10px] font-bold text-white shadow-sm">
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bottom Visual Card: Eye Retinal Detection Artwork */}
      <div className="relative z-10 p-3 pt-1">
        <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-b from-[#111638]/80 to-[#0B0F2B]/90 p-3 text-center shadow-xl backdrop-blur-md">
          {/* Subtle glow orb */}
          <div className="pointer-events-none absolute -top-8 left-1/2 h-20 w-20 -translate-x-1/2 rounded-full bg-[#6366F1]/30 blur-xl" />

          {/* Eye Icon Glow Visual */}
          <div className="relative mx-auto mb-2 flex h-10 w-10 items-center justify-center">
            <div className="relative flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-tr from-[#3b82f6] via-[#6366f1] to-[#a855f7] p-0.5 shadow-glow">
              <div className="flex h-full w-full items-center justify-center rounded-full bg-[#090C22]">
                <svg viewBox="0 0 32 32" className="h-5 w-5 text-[#38bdf8] animate-eye-glow">
                  <path
                    d="M2 16 C7 8, 25 8, 30 16 C 25 24, 7 24, 2 16 Z"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                  <circle cx="16" cy="16" r="5" fill="#6366f1" />
                  <circle cx="16" cy="16" r="2.5" fill="#090C22" />
                  <circle cx="15" cy="15" r="1" fill="#ffffff" />
                </svg>
              </div>
            </div>
          </div>

          <h3 className="text-xs font-semibold tracking-tight text-white">
            Clearer Vision Healthier Tomorrow
          </h3>
          <p className="mt-0.5 text-[10px] leading-tight text-slate-400">
            AI for Early Detection and Better Lives
          </p>

          {/* Translucent wavy light mesh */}
          <div className="my-1.5 flex items-center justify-center overflow-hidden opacity-75">
            <svg viewBox="0 0 160 16" className="h-3 w-full">
              <path
                d="M 0 8 Q 40 0, 80 8 T 160 8"
                fill="none"
                stroke="url(#sidebarWaveGrad)"
                strokeWidth="1.6"
              />
              <defs>
                <linearGradient id="sidebarWaveGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.2" />
                  <stop offset="50%" stopColor="#818cf8" stopOpacity="0.9" />
                  <stop offset="100%" stopColor="#c084fc" stopOpacity="0.2" />
                </linearGradient>
              </defs>
            </svg>
          </div>

          <p className="text-[10px] font-light italic text-indigo-200/60">
            &ldquo;Early detection saves sight.&rdquo;
          </p>
        </div>

        {/* Quick logout link / user info */}
        <div className="mt-2.5 flex items-center justify-between px-2 text-xs text-slate-400">
          <span className="truncate max-w-[140px] text-[11px] text-slate-300">
            {session?.user.name || "Meera Rao"}
          </span>
          <button
            onClick={() => {
              logout();
              router.push("/login");
            }}
            className="flex items-center gap-1 text-slate-400 hover:text-white transition-colors"
            title="Sign out"
          >
            <LogOut className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </aside>
  );
}

export function Header({ title }: { title?: string }) {
  const router = useRouter();
  const setSidebarOpen = useUiStore((s) => s.setSidebarOpen);
  const session = useAuthStore((s) => s.session);
  const logout = useAuthStore((s) => s.logout);
  const demoLogin = useAuthStore((s) => s.demoLogin);

  const [timeStr, setTimeStr] = useState("9:49 PM");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);
  const [notifsOpen, setNotifsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(3);
  const [isDark, setIsDark] = useState(false);

  const NOTIFICATIONS = [
    {
      id: 1,
      title: "3 New Referrals Pending",
      desc: "District Hospital eye OPD queue requires review.",
      time: "10m ago",
      urgent: true,
      link: "/referrals",
    },
    {
      id: 2,
      title: "High Risk DR Detected",
      desc: "Kamala Naik (PT-2024-001) flagged with Severe NPDR.",
      time: "1h ago",
      urgent: true,
      link: "/screening/SCR-2024-001",
    },
    {
      id: 3,
      title: "Follow-up Due Tomorrow",
      desc: "Rabi Gouda field health checkup scheduled.",
      time: "3h ago",
      urgent: false,
      link: "/followups",
    },
  ];

  const QUICK_SEARCH_ITEMS = [
    { title: "Kamala Naik", subtitle: "PT-2024-001 · Severe NPDR (L2)", href: "/screening/SCR-2024-001" },
    { title: "Rabi Gouda", subtitle: "PT-2024-002 · Mild NPDR (L1)", href: "/screening/SCR-2024-002" },
    { title: "Saraswati Sahu", subtitle: "PT-2024-003 · No DR (L0)", href: "/screening/SCR-2024-003" },
    { title: "New Retinal Screening", subtitle: "Capture fundus photograph & triage", href: "/screening/new" },
    { title: "Review Queue", subtitle: "12 cases waiting for ophthalmologist", href: "/review" },
  ];

  const filteredSearch = searchQuery.trim()
    ? QUICK_SEARCH_ITEMS.filter(
        (i) =>
          i.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          i.subtitle.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : QUICK_SEARCH_ITEMS;

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(
        now.toLocaleTimeString("en-US", {
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
        })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between gap-4 border-b border-slate-200/80 bg-white/90 px-6 py-3 backdrop-blur-md">
      {/* Mobile Menu Trigger & Search */}
      <div className="flex flex-1 items-center gap-4">
        <button
          className="grid h-10 w-10 place-items-center rounded-xl border border-slate-200 text-slate-700 lg:hidden hover:bg-slate-50"
          onClick={() => setSidebarOpen(true)}
          aria-label="Open menu"
        >
          ☰
        </button>

        {/* Search Bar with interactive popup */}
        <div className="relative max-w-md flex-1">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setTimeout(() => setSearchFocused(false), 250)}
            placeholder="Search patients, screenings, or IDs..."
            className="h-10 w-full rounded-2xl border border-slate-200/80 bg-slate-50/70 pl-10 pr-12 text-xs text-slate-700 placeholder-slate-400 shadow-sm transition-all focus:border-indigo-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-100"
          />
          <kbd className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 rounded-md border border-slate-200 bg-white px-1.5 py-0.5 text-[10px] font-medium text-slate-400 shadow-xs">
            ⌘ K
          </kbd>

          {/* Search Dropdown Results */}
          {searchFocused && (
            <div className="absolute left-0 top-12 z-50 w-full overflow-hidden rounded-2xl border border-slate-200 bg-white p-2 shadow-xl animate-fadeUp">
              <p className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Quick Results
              </p>
              <div className="space-y-1">
                {filteredSearch.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="flex flex-col rounded-xl px-3 py-2 text-xs transition hover:bg-indigo-50/70"
                  >
                    <span className="font-semibold text-slate-800">{item.title}</span>
                    <span className="text-[11px] text-slate-400">{item.subtitle}</span>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Center inspirational quote matching Photo 2 */}
      <div className="hidden items-center justify-center flex-1 px-4 lg:flex">
        <p className="text-xs font-semibold italic text-slate-700 tracking-wide">
          &ldquo;Early detection today, brighter tomorrows.&rdquo;
        </p>
      </div>

      {/* Right Controls & User Info */}
      <div className="flex items-center gap-3">
        {/* Theme Toggle Button */}
        <button
          onClick={() => setIsDark(!isDark)}
          className="flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200/80 bg-white text-slate-600 shadow-xs hover:bg-slate-50 transition active:scale-95"
          title="Toggle Theme"
        >
          <Sun className={cn("h-4 w-4 transition-transform", isDark ? "text-indigo-600 rotate-180" : "text-amber-500")} />
        </button>

        {/* Notifications Dropdown */}
        <div className="relative">
          <button
            onClick={() => setNotifsOpen(!notifsOpen)}
            className="relative flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200/80 bg-white text-slate-600 shadow-xs hover:bg-slate-50 transition active:scale-95"
            title="Notifications"
          >
            <Bell className="h-4 w-4" />
            {unreadCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#F43F5E] text-[10px] font-bold text-white shadow-sm animate-pulse">
                {unreadCount}
              </span>
            )}
          </button>

          {notifsOpen && (
            <div className="absolute right-0 top-12 z-50 w-80 overflow-hidden rounded-2xl border border-slate-200 bg-white p-3 shadow-2xl animate-fadeUp">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <span className="text-xs font-bold text-slate-900">Notifications</span>
                {unreadCount > 0 && (
                  <button
                    onClick={() => setUnreadCount(0)}
                    className="text-[11px] font-medium text-indigo-600 hover:underline"
                  >
                    Mark read
                  </button>
                )}
              </div>
              <div className="mt-2 divide-y divide-slate-100">
                {NOTIFICATIONS.map((n) => (
                  <Link
                    key={n.id}
                    href={n.link}
                    onClick={() => setNotifsOpen(false)}
                    className="block py-2 text-xs hover:bg-slate-50 rounded-lg px-2 transition"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-800">{n.title}</span>
                      <span className="text-[10px] text-slate-400">{n.time}</span>
                    </div>
                    <p className="mt-0.5 text-[11px] text-slate-500">{n.desc}</p>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* User Profile Dropdown Pill */}
        <div className="relative">
          <button
            onClick={() => setProfileOpen(!profileOpen)}
            className="flex items-center gap-2.5 rounded-2xl border border-slate-200/80 bg-white p-1.5 pr-3 shadow-xs hover:bg-slate-50 transition"
          >
            <div className="relative h-8 w-8 overflow-hidden rounded-full border border-indigo-200 bg-slate-100">
              <Image
                src="/meera_rao_avatar.jpg"
                alt="Meera Rao"
                width={32}
                height={32}
                className="h-full w-full object-cover"
              />
            </div>
            <div className="text-left hidden sm:block">
              <p className="text-xs font-semibold leading-tight text-slate-800">
                {session?.user.name || "Meera Rao"}
              </p>
              <p className="text-[10px] text-slate-400 capitalize">
                {session?.user.role === "admin"
                  ? "Admin"
                  : session?.user.role === "health_worker"
                  ? "Health Worker"
                  : session?.user.role === "patient"
                  ? "Patient"
                  : "Ophthalmologist"}
              </p>
            </div>
            <ChevronDown className="h-3.5 w-3.5 text-slate-400 hidden sm:block" />
          </button>

          {profileOpen && (
            <div className="absolute right-0 top-12 z-50 w-64 overflow-hidden rounded-2xl border border-slate-200 bg-white p-3 shadow-2xl animate-fadeUp">
              <div className="border-b border-slate-100 pb-2.5">
                <p className="text-xs font-bold text-slate-900">{session?.user.name || "Meera Rao"}</p>
                <p className="text-[11px] text-slate-500">{session?.user.email || "admin@drishti.ai"}</p>
                <p className="mt-1 text-[10px] text-indigo-600 font-medium">NPCB State Cell, Bhubaneswar</p>
              </div>
              <div className="my-2 space-y-1">
                <p className="px-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">Switch Role</p>
                <button
                  onClick={() => { demoLogin("admin"); setProfileOpen(false); }}
                  className="w-full text-left rounded-lg px-2 py-1.5 text-xs text-slate-700 hover:bg-indigo-50 font-medium"
                >
                  Admin (Meera Rao)
                </button>
                <button
                  onClick={() => { demoLogin("patient"); router.push("/portal"); setProfileOpen(false); }}
                  className="w-full text-left rounded-lg px-2 py-1.5 text-xs text-indigo-700 hover:bg-indigo-50 font-bold flex items-center justify-between"
                >
                  <span>Patient Portal (Kamala)</span>
                  <span className="rounded bg-sky-100 px-1.5 py-0.5 text-[9px] font-bold text-sky-700">Patient</span>
                </button>
                <button
                  onClick={() => { demoLogin("ophthalmologist"); setProfileOpen(false); }}
                  className="w-full text-left rounded-lg px-2 py-1.5 text-xs text-slate-700 hover:bg-indigo-50 font-medium"
                >
                  Ophthalmologist (Dr. Suresh)
                </button>
                <button
                  onClick={() => { demoLogin("health_worker"); setProfileOpen(false); }}
                  className="w-full text-left rounded-lg px-2 py-1.5 text-xs text-slate-700 hover:bg-indigo-50 font-medium"
                >
                  Health Worker (Anita)
                </button>
              </div>
              <div className="border-t border-slate-100 pt-2">
                <Link
                  href="/settings"
                  onClick={() => setProfileOpen(false)}
                  className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-xs text-slate-700 hover:bg-slate-50"
                >
                  <Settings className="h-3.5 w-3.5" /> Settings
                </Link>
                <button
                  onClick={() => { logout(); router.push("/login"); }}
                  className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-xs text-rose-600 hover:bg-rose-50"
                >
                  <LogOut className="h-3.5 w-3.5" /> Sign Out
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Date & Time Widget */}
        <div className="hidden items-center gap-2 rounded-2xl border border-slate-200/80 bg-white px-3 py-1.5 shadow-xs md:flex">
          <Calendar className="h-4 w-4 text-indigo-500" />
          <div className="text-[11px] leading-tight">
            <p className="font-semibold text-slate-700">Mon, 01 Sept 2026</p>
            <p className="text-slate-400">{timeStr}</p>
          </div>
        </div>
      </div>
    </header>
  );
}

export function MobileNav() {
  const path = usePathname();
  const items = NAV_ITEMS.slice(0, 5);

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 flex border-t border-slate-200 bg-white/95 px-2 py-2 backdrop-blur-lg lg:hidden shadow-lg">
      {items.map((item) => {
        const active = path === item.href || (item.href !== "/dashboard" && path.startsWith(item.href));
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex flex-1 flex-col items-center gap-1 rounded-xl py-1 text-[10px] font-medium transition-colors",
              active ? "text-indigo-600 font-bold" : "text-slate-500"
            )}
          >
            <Icon className={cn("h-5 w-5", active && "animate-float text-indigo-600")} />
            <span>{item.label.split(" ")[0]}</span>
          </Link>
        );
      })}
    </nav>
  );
}

