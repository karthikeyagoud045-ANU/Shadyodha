"use client";

import Link from "next/link";
import { useUiStore } from "@/store/ui-store";
import { useAuthStore } from "@/store/auth-store";

const STEPS = [
  { href: "/login", label: "Login" },
  { href: "/dashboard", label: "Dashboard" },
  { href: "/patients/new", label: "Register" },
  { href: "/screening/new", label: "Screen" },
  { href: "/screening/SCR-2024-001", label: "Result" },
  { href: "/review", label: "Review" },
  { href: "/review/SCR-2024-001", label: "Decide" },
  { href: "/referrals", label: "Referrals" },
  { href: "/followups", label: "Follow-up" },
];

export function DemoRail({ path }: { path: string }) {
  const open = useUiStore((s) => s.demoPanel);
  const set = useUiStore((s) => s.setDemoPanel);
  const demo = useAuthStore((s) => s.demoLogin);
  if (!open) {
    return null;
  }
  return (
    <aside className="sticky top-0 hidden h-screen w-52 shrink-0 border-l border-ink-200 bg-white p-4 xl:block">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-wider text-ink-400">Demo mode</p>
        <button className="text-xs text-ink-400" onClick={() => set(false)}>
          Hide
        </button>
      </div>
      <ol className="mt-4 space-y-2">
        {STEPS.map((s, i) => (
          <li key={s.href}>
            <Link
              href={s.href}
              className={`btn-attract flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-xs ${
                path === s.href ? "bg-ink-900 text-white" : "bg-ink-50 text-ink-700"
              }`}
            >
              <span className="tabular-nums opacity-60">{i + 1}</span>
              {s.label}
            </Link>
          </li>
        ))}
      </ol>
      <div className="mt-6 space-y-2">
        <p className="text-[10px] uppercase tracking-wider text-ink-400">Switch role</p>
        {(["health_worker", "ophthalmologist", "admin"] as const).map((r) => (
          <button
            key={r}
            className="btn-attract h-9 w-full rounded-xl border border-ink-200 text-xs capitalize"
            onClick={() => demo(r)}
          >
            {r.replace("_", " ")}
          </button>
        ))}
      </div>
    </aside>
  );
}
