"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuthStore } from "@/store/auth-store";
import type { UserRole } from "@/types";

const ROLES: { id: UserRole; label: string }[] = [
  { id: "admin", label: "Admin" },
  { id: "patient", label: "Patient" },
  { id: "ophthalmologist", label: "Doctor" },
  { id: "health_worker", label: "Health Worker" },
];

export default function LoginPage() {
  const router = useRouter();
  const { login, demoLogin, loading, error } = useAuthStore();
  const [email, setEmail] = useState("admin@drishti.ai");
  const [password, setPassword] = useState("demo123");
  const [role, setRole] = useState<UserRole>("admin");
  const [remember, setRemember] = useState(true);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    try {
      await login(email, password, role);
      if (role === "patient") {
        router.push("/portal");
      } else {
        router.push("/dashboard");
      }
    } catch {
      /* store sets error */
    }
  }

  async function demo(r: UserRole) {
    await demoLogin(r);
    if (r === "patient") {
      router.push("/portal");
    } else {
      router.push("/dashboard");
    }
  }

  return (
    <div className="grid min-h-screen lg:grid-cols-2 bg-[#F4F6FC]">
      <section className="relative hidden overflow-hidden bg-[#090C22] text-white lg:flex lg:flex-col lg:justify-between p-12">
        {/* Background Image: Retinal Neural Net */}
        <div
          className="pointer-events-none absolute inset-0 z-0 bg-[url('/login_dark_bg.jpg')] bg-cover bg-center opacity-65 mix-blend-screen"
          aria-hidden
        />
        {/* Gradient dark overlays */}
        <div className="pointer-events-none absolute inset-0 z-0 bg-gradient-to-t from-[#090C22] via-[#090C22]/60 to-[#090C22]/90" />
        <div className="pointer-events-none absolute -left-20 -top-20 h-80 w-80 rounded-full bg-indigo-600/30 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 -right-20 h-96 w-96 rounded-full bg-purple-600/35 blur-3xl" />

        <div className="relative z-10">
          <Logo light />
        </div>
        <div className="relative z-10 my-auto py-12">
          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-indigo-300">
            SIH26038 · ShadYodha
          </p>
          <h1 className="mt-4 max-w-md text-4xl font-bold leading-tight tracking-tight text-white">
            AI-powered retinal screening for accessible eye care.
          </h1>
          <p className="mt-4 max-w-sm text-sm text-slate-300 leading-relaxed">
            Explainable diabetic retinopathy triage for rural India — capture, grade, refer, follow up.
          </p>
        </div>
        <div className="relative z-10 flex items-center justify-between text-xs text-slate-400">
          <p className="tracking-widest uppercase text-[10px]">AI-Powered Retinal Screening</p>
          <p className="italic text-indigo-200/60">&ldquo;Vision is a right, not a privilege.&rdquo;</p>
        </div>
      </section>

      <section className="relative flex items-center justify-center p-6 md:p-12 overflow-hidden">
        {/* Background Image: High-Tech Retinal Eye Artwork from Doctor Portal */}
        <div
          className="pointer-events-none absolute inset-0 z-0 bg-[url('/drishti_hero_bg.jpg')] bg-cover bg-center opacity-40 mix-blend-multiply"
          aria-hidden
        />
        <div className="pointer-events-none absolute -left-10 -top-10 h-72 w-72 rounded-full bg-cyan-400/25 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-10 -right-10 h-72 w-72 rounded-full bg-indigo-500/25 blur-3xl" />
        <div className="pointer-events-none absolute inset-0 z-0 bg-gradient-to-b from-[#EFF3FD]/60 via-white/50 to-[#EFF3FD]/80 backdrop-blur-xs" />

        <form
          onSubmit={submit}
          className="relative z-10 w-full max-w-md space-y-5 rounded-3xl border border-white/80 bg-white/95 p-8 shadow-card backdrop-blur-xl"
        >
          <div className="lg:hidden">
            <Logo />
          </div>
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-slate-900">Sign in</h2>
            <p className="mt-1 text-xs text-slate-500">
              Welcome back to DRISHTI AI. Sign in to your account.
            </p>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="email" className="text-xs font-semibold text-slate-700">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-10 rounded-xl"
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="password" className="text-xs font-semibold text-slate-700">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="h-10 rounded-xl"
              required
            />
          </div>
          <div>
            <p className="mb-2 text-xs font-semibold text-slate-700">Role</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
              {ROLES.map((r) => (
                <button
                  type="button"
                  key={r.id}
                  onClick={() => setRole(r.id)}
                  className={`h-9 rounded-xl text-xs font-semibold transition ${
                    role === r.id
                      ? "bg-gradient-to-r from-[#5B4EFF] to-[#8659F6] text-white shadow-sm"
                      : "border border-slate-200 text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  {r.label}
                </button>
              ))}
            </div>
          </div>
          <div className="flex items-center justify-between text-xs text-slate-500">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
                className="rounded border-slate-300 text-indigo-600"
              />
              Remember me
            </label>
            <button type="button" className="hover:text-indigo-600 hover:underline">
              Forgot password?
            </button>
          </div>
          {error && <p className="rounded-xl bg-rose-50 p-3 text-xs text-rose-700">{error}</p>}
          <Button
            type="submit"
            className="w-full h-10 rounded-xl bg-gradient-to-r from-[#5B4EFF] to-[#8659F6] text-white font-semibold shadow-md shadow-indigo-500/25"
            loading={loading}
          >
            Sign In
          </Button>
          <div className="pt-2 border-t border-slate-100">
            <p className="mb-2 text-center text-[11px] font-medium text-slate-400 uppercase tracking-wider">
              Quick Demo Access
            </p>
            <div className="grid gap-2">
              {/* Patient Portal Demo Button */}
              <button
                type="button"
                onClick={() => demo("patient")}
                className="flex h-10 items-center justify-between rounded-xl border border-sky-200 bg-gradient-to-r from-sky-50 via-indigo-50/70 to-purple-50/50 px-3.5 text-xs font-bold text-sky-800 shadow-xs hover:border-sky-300 transition active:scale-95"
              >
                <div className="flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-sky-200 text-[10px] font-extrabold text-sky-700">
                    KN
                  </span>
                  <span>Patient Portal (Kamala Naik)</span>
                </div>
                <span className="rounded-lg bg-sky-600 px-2 py-0.5 text-[10px] text-white shadow-xs">
                  Open Portal &rarr;
                </span>
              </button>

              <button
                type="button"
                onClick={() => demo("admin")}
                className="flex h-9 items-center justify-center rounded-xl border border-indigo-200 bg-indigo-50/50 text-xs font-semibold text-indigo-700 hover:bg-indigo-100/60 transition"
              >
                Demo as Meera Rao (Admin)
              </button>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => demo("health_worker")}
                  className="flex h-8 items-center justify-center rounded-xl border border-slate-200 text-xs text-slate-600 hover:bg-slate-50 transition"
                >
                  Health Worker
                </button>
                <button
                  type="button"
                  onClick={() => demo("ophthalmologist")}
                  className="flex h-8 items-center justify-center rounded-xl border border-slate-200 text-xs text-slate-600 hover:bg-slate-50 transition"
                >
                  Ophthalmologist
                </button>
              </div>
            </div>
          </div>
        </form>
      </section>
    </div>
  );
}
