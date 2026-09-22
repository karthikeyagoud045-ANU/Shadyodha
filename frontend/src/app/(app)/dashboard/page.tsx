"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Area,
  AreaChart,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  ArrowRight,
  BarChart2,
  Calendar,
  Check,
  ChevronDown,
  Clock,
  Eye,
  FileText,
  FlaskConical,
  MoreHorizontal,
  Send,
  Sparkles,
  TrendingUp,
  UserPlus,
  Users,
} from "lucide-react";
import { AnimatedCounter } from "@/components/AnimatedCounter";
import { greeting } from "@/lib/utils";

// Trends 7-day data
const TRENDS_DATA = [
  { day: "Aug 26", count: 5 },
  { day: "Aug 27", count: 8 },
  { day: "Aug 28", count: 11 },
  { day: "Aug 29", count: 7 },
  { day: "Aug 30", count: 10 },
  { day: "Aug 31", count: 16 },
  { day: "Sep 01", count: 12 },
];

// DR Severity segments
const SEVERITY_DATA = [
  { name: "No DR", value: 50, count: 10, color: "#10B981" },
  { name: "Mild", value: 20, count: 4, color: "#0EA5E9" },
  { name: "Moderate", value: 15, count: 3, color: "#F59E0B" },
  { name: "Severe", value: 10, count: 2, color: "#F43F5E" },
  { name: "Refer", value: 5, count: 1, color: "#8B5CF6" },
];

// Upcoming follow-up patients
const FOLLOWUPS = [
  {
    initials: "KN",
    initialsBg: "bg-purple-100 text-purple-700",
    name: "Komala Naik",
    date: "02 Sept 2026",
    priority: "High",
    badgeClass: "bg-rose-50 text-rose-600 border border-rose-100",
  },
  {
    initials: "RG",
    initialsBg: "bg-emerald-100 text-emerald-700",
    name: "Rabi Gouda",
    date: "03 Sept 2026",
    priority: "Low",
    badgeClass: "bg-slate-100 text-slate-600 border border-slate-200",
  },
  {
    initials: "SS",
    initialsBg: "bg-indigo-100 text-indigo-700",
    name: "Saraswati Sahu",
    date: "03 Sept 2026",
    priority: "Medium",
    badgeClass: "bg-amber-50 text-amber-700 border border-amber-100",
  },
  {
    initials: "AK",
    initialsBg: "bg-rose-100 text-rose-700",
    name: "Ajay Kumar",
    date: "04 Sept 2026",
    priority: "High",
    badgeClass: "bg-rose-50 text-rose-600 border border-rose-100",
  },
  {
    initials: "LR",
    initialsBg: "bg-sky-100 text-sky-700",
    name: "Lalitha Reddy",
    date: "04 Sept 2026",
    priority: "Medium",
    badgeClass: "bg-amber-50 text-amber-700 border border-amber-100",
  },
];

// Recent screenings
const RECENT_SCREENINGS = [
  {
    id: "SCR-2024-001",
    patient: "Kamala Naik",
    date: "01 Sept 2026",
    drLevel: "L2",
    status: "Reviewed",
    priority: "High",
    statusColor: "bg-emerald-50 text-emerald-700 border-emerald-200",
    priorityColor: "bg-rose-500",
  },
  {
    id: "SCR-2024-002",
    patient: "Rabi Gouda",
    date: "02 Sept 2026",
    drLevel: "L1",
    status: "Completed",
    priority: "Low",
    statusColor: "bg-emerald-50 text-emerald-700 border-emerald-200",
    priorityColor: "bg-sky-500",
  },
  {
    id: "SCR-2024-003",
    patient: "Saraswati Sahu",
    date: "02 Sept 2026",
    drLevel: "L0",
    status: "Completed",
    priority: "Medium",
    statusColor: "bg-emerald-50 text-emerald-700 border-emerald-200",
    priorityColor: "bg-amber-500",
  },
  {
    id: "SCR-2024-004",
    patient: "Ajay Kumar",
    date: "03 Sept 2026",
    drLevel: "L2",
    status: "Referred",
    priority: "High",
    statusColor: "bg-rose-50 text-rose-700 border-rose-200",
    priorityColor: "bg-rose-500",
  },
  {
    id: "SCR-2024-005",
    patient: "Lalitha Reddy",
    date: "03 Sept 2026",
    drLevel: "L1",
    status: "Under Review",
    priority: "Medium",
    statusColor: "bg-amber-50 text-amber-700 border-amber-200",
    priorityColor: "bg-amber-500",
  },
];

// Mini sparkline component with staggered rising bars
function SparklineBars({
  color,
  heights = [40, 65, 50, 95],
}: {
  color: string;
  heights?: number[];
}) {
  return (
    <div className="flex items-end gap-1 h-7">
      {heights.map((h, i) => (
        <span
          key={i}
          className="w-1.5 rounded-t-sm animate-bar-rise"
          style={{
            height: `${h}%`,
            backgroundColor: color,
            animationDelay: `${i * 120}ms`,
          }}
        />
      ))}
    </div>
  );
}

// Custom Tooltip for Recharts
function CustomTooltip({ active, payload, label }: any) {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-xl bg-[#090C22] px-3 py-1.5 text-xs text-white shadow-xl border border-white/10">
        <p className="font-semibold">{payload[0].value} screenings</p>
        <p className="text-[10px] text-slate-400">{label}, 2026</p>
      </div>
    );
  }
  return null;
}

export default function DashboardPage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="relative space-y-6 pb-12">
      {/* Hero Ambient Clinic & Eye HUD Artwork Banner matching Photo 2 */}
      <div className="pointer-events-none absolute -left-8 -right-8 -top-6 h-80 overflow-hidden z-0 rounded-b-3xl">
        <img
          src="/drishti_hero_bg.jpg"
          alt="AI Retinal Scan In Progress"
          className="h-full w-full object-cover object-center opacity-30 mix-blend-multiply"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#F4F6FC]/60 to-[#F4F6FC]" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#F4F6FC]/80 via-transparent to-[#F4F6FC]/80" />
      </div>

      {/* 1. Header Greeting (Stagger 1) matching Photo 2 */}
      <div className="relative z-10 stagger-1 flex flex-wrap items-center justify-between gap-4 pt-2">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            {greeting()}, Meera 👋
          </h1>
          <p className="mt-1 text-sm font-medium text-slate-600">
            Your work today helps create a brighter tomorrow.
          </p>
          <p className="mt-1.5 text-[11px] font-bold tracking-[0.2em] text-indigo-600/80 uppercase">
            AI FOR EARLY DETECTION &bull; HEALTHIER COMMUNITIES &bull; BRIGHTER LIVES
          </p>
        </div>

        {/* Action Buttons matching Photo 2 */}
        <div className="flex items-center gap-3">
          <Link href="/patients/new">
            <button className="flex items-center gap-2 rounded-xl border border-slate-200/80 bg-white/95 px-4 py-2 text-xs font-bold text-slate-700 shadow-sm backdrop-blur-md hover:bg-slate-50 transition active:scale-95">
              <UserPlus className="h-4 w-4 text-indigo-600" />
              <span>Register Patient</span>
            </button>
          </Link>
          <Link href="/screening/new">
            <button className="btn-attract flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#5B4EFF] to-[#8659F6] px-4 py-2 text-xs font-bold text-white shadow-md shadow-indigo-500/25 hover:brightness-105 transition active:scale-95">
              <span>+ Start New Screening</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </Link>
        </div>
      </div>

      {/* 2. Top 4 KPI Cards (Stagger 2, 3, 4, 5) */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {/* KPI 1: Total Screened */}
        <div className="stagger-2 hover-lift relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 shadow-card">
          <div className="flex items-start justify-between">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-sky-50 text-sky-600">
              <Users className="h-5 w-5" />
            </div>
            <SparklineBars color="#0ea5e9" heights={[35, 60, 45, 90]} />
          </div>
          <p className="mt-3 text-xs font-medium text-slate-500">Total Screened</p>
          <div className="mt-1 flex items-baseline justify-between">
            <p className="text-3xl font-bold tracking-tight text-slate-900">
              <AnimatedCounter value={20} />
            </p>
          </div>
          <p className="mt-2 flex items-center gap-1 text-xs font-semibold text-emerald-600">
            <span>↗</span> +12 this week
          </p>
        </div>

        {/* KPI 2: Pending Review */}
        <div className="stagger-3 hover-lift relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 shadow-card">
          <div className="flex items-start justify-between">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
              <Clock className="h-5 w-5" />
            </div>
            <SparklineBars color="#10b981" heights={[70, 45, 85, 60]} />
          </div>
          <p className="mt-3 text-xs font-medium text-slate-500">Pending Review</p>
          <div className="mt-1 flex items-baseline justify-between">
            <p className="text-3xl font-bold tracking-tight text-slate-900">
              <AnimatedCounter value={12} />
            </p>
          </div>
          <p className="mt-2 flex items-center gap-1.5 text-xs text-slate-500">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            Queue live
          </p>
        </div>

        {/* KPI 3: Referred */}
        <div className="stagger-4 hover-lift relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 shadow-card">
          <div className="flex items-start justify-between">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-rose-50 text-rose-500">
              <Send className="h-5 w-5" />
            </div>
            <SparklineBars color="#f43f5e" heights={[30, 80, 50, 65]} />
          </div>
          <p className="mt-3 text-xs font-medium text-slate-500">Referred</p>
          <div className="mt-1 flex items-baseline justify-between">
            <p className="text-3xl font-bold tracking-tight text-slate-900">
              <AnimatedCounter value={6} />
            </p>
          </div>
          <p className="mt-2 text-xs text-slate-500">Open referral cases</p>
        </div>

        {/* KPI 4: Follow-ups Due */}
        <div className="stagger-5 hover-lift relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 shadow-card">
          <div className="flex items-start justify-between">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-purple-50 text-purple-600">
              <Calendar className="h-5 w-5" />
            </div>
            <SparklineBars color="#8b5cf6" heights={[55, 30, 90, 70]} />
          </div>
          <p className="mt-3 text-xs font-medium text-slate-500">Follow-ups Due</p>
          <div className="mt-1 flex items-baseline justify-between">
            <p className="text-3xl font-bold tracking-tight text-slate-900">
              <AnimatedCounter value={6} />
            </p>
          </div>
          <p className="mt-2 text-xs text-slate-500">Needs field action</p>
        </div>
      </div>

      {/* 3. Middle Section: Trends, Donut, Follow-ups, and AI Promo */}
      <div className="grid gap-6 lg:grid-cols-12">
        {/* Left Column (Trends + Donut + Table) */}
        <div className="space-y-6 lg:col-span-8">
          {/* Top Charts Row */}
          <div className="grid gap-6 md:grid-cols-2">
            {/* Box 6: Screening Trends (Stagger 6) */}
            <div className="stagger-6 hover-lift flex flex-col justify-between rounded-2xl border border-slate-200/80 bg-white p-5 shadow-card">
              <div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-50 text-purple-600">
                      <TrendingUp className="h-4 w-4" />
                    </div>
                    <div>
                      <h2 className="text-sm font-semibold text-slate-900">
                        Screening Trends
                      </h2>
                      <p className="text-[11px] text-slate-400">
                        Total screenings over the last 7 days
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-50/70 px-2.5 py-1 text-[11px] font-medium text-slate-600">
                    <span>Last 7 days</span>
                    <ChevronDown className="h-3 w-3 text-slate-400" />
                  </div>
                </div>

                {/* Area Chart */}
                <div className="mt-6 h-48 w-full">
                  {mounted && (
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart
                        data={TRENDS_DATA}
                        margin={{ top: 10, right: 10, left: -25, bottom: 0 }}
                      >
                        <defs>
                          <linearGradient id="trendsGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.35} />
                            <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0.0} />
                          </linearGradient>
                        </defs>
                        <XAxis
                          dataKey="day"
                          axisLine={false}
                          tickLine={false}
                          tick={{ fill: "#94a3b8", fontSize: 10 }}
                        />
                        <YAxis
                          axisLine={false}
                          tickLine={false}
                          tick={{ fill: "#94a3b8", fontSize: 10 }}
                          domain={[0, 20]}
                          ticks={[0, 5, 10, 15, 20]}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Area
                          type="monotone"
                          dataKey="count"
                          stroke="#7C3AED"
                          strokeWidth={2.5}
                          fillOpacity={1}
                          fill="url(#trendsGrad)"
                          dot={{
                            r: 3.5,
                            fill: "#7C3AED",
                            strokeWidth: 2,
                            stroke: "#fff",
                          }}
                          activeDot={{
                            r: 6,
                            fill: "#7C3AED",
                            stroke: "#fff",
                            strokeWidth: 2,
                          }}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </div>
            </div>

            {/* Box 7: DR Severity Distribution (Stagger 7) */}
            <div className="stagger-7 hover-lift flex flex-col justify-between rounded-2xl border border-slate-200/80 bg-white p-5 shadow-card">
              <div>
                <div className="flex items-center gap-2.5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                    <PieChart className="h-4 w-4" />
                  </div>
                  <div>
                    <h2 className="text-sm font-semibold text-slate-900">
                      DR Severity Distribution
                    </h2>
                  </div>
                </div>

                {/* Donut Chart with Center Text & Right Legend */}
                <div className="mt-4 flex items-center justify-between gap-2">
                  <div className="relative h-44 w-44 shrink-0">
                    {mounted && (
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={SEVERITY_DATA}
                            cx="50%"
                            cy="50%"
                            innerRadius={50}
                            outerRadius={70}
                            paddingAngle={3}
                            dataKey="value"
                            startAngle={90}
                            endAngle={-270}
                          >
                            {SEVERITY_DATA.map((entry, index) => (
                              <Cell
                                key={`cell-${index}`}
                                fill={entry.color}
                                stroke="none"
                              />
                            ))}
                          </Pie>
                        </PieChart>
                      </ResponsiveContainer>
                    )}
                    {/* Donut center metrics */}
                    <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
                      <span className="text-2xl font-bold tracking-tight text-slate-900">
                        20
                      </span>
                      <span className="text-[10px] font-medium text-slate-400">
                        Screenings
                      </span>
                    </div>
                  </div>

                  {/* Legend list on right */}
                  <div className="flex-1 space-y-2 text-xs">
                    {SEVERITY_DATA.map((item) => (
                      <div
                        key={item.name}
                        className="flex items-center justify-between text-slate-600"
                      >
                        <div className="flex items-center gap-2">
                          <span
                            className="h-2.5 w-2.5 rounded-full"
                            style={{ backgroundColor: item.color }}
                          />
                          <span className="font-medium text-slate-700">
                            {item.name}
                          </span>
                        </div>
                        <span className="font-bold text-slate-900">
                          {item.value}%
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Box 11: Recent Screenings Table (Stagger 11) */}
          <div className="stagger-11 hover-lift overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-card">
            <div className="flex items-center justify-between border-b border-slate-100 p-5">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-50 text-purple-600">
                  <FileText className="h-4 w-4" />
                </div>
                <div>
                  <h2 className="text-sm font-semibold text-slate-900">
                    Recent Screenings
                  </h2>
                  <p className="text-[11px] text-slate-400">
                    Latest screening activity and status
                  </p>
                </div>
              </div>
              <Link
                href="/screenings"
                className="flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-700"
              >
                <span>View all</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-slate-100 bg-slate-50/50 text-[11px] font-medium text-slate-400">
                  <tr>
                    <th className="px-5 py-3 font-medium">ID</th>
                    <th className="px-5 py-3 font-medium">Patient</th>
                    <th className="px-5 py-3 font-medium">Date</th>
                    <th className="px-5 py-3 font-medium">DR Level</th>
                    <th className="px-5 py-3 font-medium">Status</th>
                    <th className="px-5 py-3 font-medium">Priority</th>
                    <th className="px-5 py-3 font-medium">Action</th>
                    <th className="px-3 py-3"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  {RECENT_SCREENINGS.map((row, idx) => (
                    <tr
                      key={row.id}
                      className="group transition-colors hover:bg-slate-50/70"
                    >
                      <td className="px-5 py-3.5 font-semibold text-slate-900">
                        {row.id}
                      </td>
                      <td className="px-5 py-3.5 font-medium text-slate-800">
                        {row.patient}
                      </td>
                      <td className="px-5 py-3.5 text-slate-500">{row.date}</td>
                      <td className="px-5 py-3.5">
                        <span className="rounded-lg bg-indigo-50 px-2 py-0.5 text-[11px] font-bold text-indigo-700">
                          {row.drLevel}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold border ${row.statusColor}`}
                        >
                          {row.status === "Reviewed" || row.status === "Completed" ? (
                            <Check className="h-3 w-3 stroke-[3]" />
                          ) : (
                            <span className="h-1.5 w-1.5 rounded-full bg-current" />
                          )}
                          {row.status}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-slate-700">
                          <span
                            className={`h-2 w-2 rounded-full ${row.priorityColor}`}
                          />
                          {row.priority}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <Link href={`/screening/${row.id}`}>
                          <button className="rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-3.5 py-1 text-[11px] font-semibold text-white shadow-xs hover:brightness-110 transition">
                            View
                          </button>
                        </Link>
                      </td>
                      <td className="px-3 py-3.5 text-slate-400">
                        <button className="p-1 hover:text-slate-600">
                          <MoreHorizontal className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Column (Upcoming Follow-ups + AI Promo Card + Better Sight Card) */}
        <div className="space-y-6 lg:col-span-4 relative">
          {/* Floating script caption matching Photo 2 */}
          <div className="hidden lg:block text-right -mt-2 mb-1 pr-2">
            <span className="font-serif italic text-sm text-slate-500 tracking-wide">
              &ldquo;Because every eye tells a story&rdquo;
            </span>
          </div>

          {/* Box 8: Upcoming Follow-ups (Stagger 8) */}
          <div className="stagger-8 hover-lift rounded-2xl border border-slate-200/80 bg-white/95 p-5 shadow-card backdrop-blur-md">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-indigo-600" />
                <h2 className="text-sm font-semibold text-slate-900">
                  Upcoming Follow-ups
                </h2>
              </div>
              <Link
                href="/followups"
                className="flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-700"
              >
                <span>View all</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            <div className="mt-3 divide-y divide-slate-100">
              {FOLLOWUPS.map((f, i) => (
                <div
                  key={f.name}
                  className="flex items-center justify-between py-2.5 transition hover:bg-slate-50/50 rounded-xl px-1"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold ${f.initialsBg}`}
                    >
                      {f.initials}
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-800">
                        {f.name}
                      </p>
                      <p className="text-[10px] text-slate-400">
                        Follow-up • {f.date}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${f.badgeClass}`}
                  >
                    {f.priority}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Box 9: AI Retinal Eye Promo Card (Stagger 9) */}
          <div className="stagger-9 hover-lift relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#0B0F2A] via-[#101744] to-[#1E1B4B] p-5 text-white shadow-xl">
            {/* Ambient lighting glows */}
            <div className="pointer-events-none absolute -right-10 -top-10 h-36 w-36 rounded-full bg-cyan-500/20 blur-2xl" />
            <div className="pointer-events-none absolute -bottom-10 -left-10 h-36 w-36 rounded-full bg-purple-500/30 blur-2xl" />

            {/* Glowing Retinal Scan Visual */}
            <div className="relative mx-auto my-2 flex h-36 w-36 items-center justify-center">
              <div className="absolute inset-0 rounded-full border border-cyan-400/40 animate-pulse" />
              <div className="absolute inset-2 rounded-full border border-purple-500/40 animate-radar" />
              <div className="relative h-28 w-28 overflow-hidden rounded-full border-2 border-cyan-400 shadow-glow">
                <img
                  src="/retinal_eye_promo.jpg"
                  alt="AI Retinal Scan"
                  className="h-full w-full object-cover"
                />
              </div>
            </div>

            <div className="mt-3 text-left">
              <h3 className="text-sm font-bold tracking-tight text-white leading-snug">
                AI Powered. Human Centered.
                <br />
                Brighter Futures.
              </h3>
            </div>

            {/* Circular Action Button */}
            <div className="mt-4 flex items-center justify-between">
              <Link href="/screening/new">
                <button
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-slate-900 shadow-md transition hover:scale-110 active:scale-95"
                  title="Start Scan"
                >
                  <ArrowRight className="h-4 w-4" />
                </button>
              </Link>

              <div className="text-[10px] font-medium tracking-wider text-slate-400">
                Detect | Prevent | Preserve
              </div>
            </div>
          </div>

          {/* Box 10: Better Sight Brighter Lives Card matching Photo 2 */}
          <div className="stagger-10 hover-lift relative overflow-hidden rounded-2xl border border-sky-100/80 bg-gradient-to-br from-white/95 via-sky-50/50 to-indigo-50/60 p-5 text-center shadow-card backdrop-blur-md">
            {/* Glowing Hand & Heart/Eye Icon */}
            <div className="relative mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-sky-400/20 via-indigo-500/20 to-purple-500/20 text-indigo-600 shadow-sm">
              <svg viewBox="0 0 24 24" className="h-6 w-6 stroke-[1.8]" fill="none" stroke="currentColor">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" fill="currentColor" fillOpacity="0.15" />
                <circle cx="12" cy="9" r="2.5" fill="currentColor" />
              </svg>
            </div>
            <h4 className="text-sm font-bold text-slate-900 tracking-tight">
              Better Sight
            </h4>
            <p className="text-xs font-semibold text-indigo-600">
              Brighter Lives
            </p>
            {/* Glowing accent dash */}
          </div>
        </div>
      </div>

      {/* 4. Bottom Row: 3 Quick Action Cards (Stagger 12, 13, 14) */}
      <div className="grid gap-4 sm:grid-cols-3">
        {/* Card 1: Register Patient */}
        <Link href="/patients/new">
          <div className="stagger-12 hover-lift group flex items-center justify-between rounded-2xl border border-slate-200/80 bg-white p-4 shadow-card">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-sky-50 text-sky-600 transition group-hover:scale-110">
                <Users className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-slate-900 group-hover:text-indigo-600 transition">
                  Register Patient
                </h3>
                <p className="text-[11px] text-slate-400">
                  Add new patient to the system
                </p>
              </div>
            </div>
            <div className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 text-slate-400 transition group-hover:border-indigo-400 group-hover:text-indigo-600">
              <ArrowRight className="h-4 w-4" />
            </div>
          </div>
        </Link>

        {/* Card 2: Run Simulation */}
        <Link href="/simulation">
          <div className="stagger-13 hover-lift group flex items-center justify-between rounded-2xl border border-slate-200/80 bg-white p-4 shadow-card">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-purple-50 text-purple-600 transition group-hover:scale-110">
                <FlaskConical className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-slate-900 group-hover:text-indigo-600 transition">
                  Run Simulation
                </h3>
                <p className="text-[11px] text-slate-400">
                  Train & test with sample data
                </p>
              </div>
            </div>
            <div className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 text-slate-400 transition group-hover:border-indigo-400 group-hover:text-indigo-600">
              <ArrowRight className="h-4 w-4" />
            </div>
          </div>
        </Link>

        {/* Card 3: View Reports */}
        <Link href="/screenings">
          <div className="stagger-14 hover-lift group flex items-center justify-between rounded-2xl border border-slate-200/80 bg-white p-4 shadow-card">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 transition group-hover:scale-110">
                <BarChart2 className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-slate-900 group-hover:text-indigo-600 transition">
                  View Reports
                </h3>
                <p className="text-[11px] text-slate-400">
                  Insights and analytics
                </p>
              </div>
            </div>
            <div className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 text-slate-400 transition group-hover:border-indigo-400 group-hover:text-indigo-600">
              <ArrowRight className="h-4 w-4" />
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
}
