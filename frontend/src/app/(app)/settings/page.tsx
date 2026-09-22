"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuthStore } from "@/store/auth-store";
import { ROLE_LABEL } from "@/lib/utils";

export default function SettingsPage() {
  const router = useRouter();
  const session = useAuthStore((s) => s.session);
  const logout = useAuthStore((s) => s.logout);

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="text-2xl font-semibold">Settings</h1>
      <section className="space-y-3 rounded-2xl border border-ink-200 bg-white p-6">
        <h2 className="font-semibold">Profile</h2>
        <p className="text-sm">{session?.user.name}</p>
        <p className="text-sm text-ink-500">{session?.user.email} · {ROLE_LABEL[session?.user.role ?? ""]}</p>
        <p className="text-sm text-ink-500">{session?.user.facility}</p>
      </section>
      <section className="space-y-3 rounded-2xl border border-ink-200 bg-white p-6">
        <h2 className="font-semibold">Change Password</h2>
        <div className="space-y-2"><Label>Current</Label><Input type="password" defaultValue="demo123" /></div>
        <div className="space-y-2"><Label>New</Label><Input type="password" /></div>
        <Button onClick={() => alert("Password updated in demo mode.")}>Update password</Button>
      </section>
      <section className="space-y-3 rounded-2xl border border-ink-200 bg-white p-6">
        <h2 className="font-semibold">Notification Preferences</h2>
        {["High-priority referrals", "Overdue follow-ups", "Offline sync complete"].map((n) => (
          <label key={n} className="flex items-center justify-between text-sm">
            {n}
            <input type="checkbox" defaultChecked className="h-4 w-4 accent-ink-900" />
          </label>
        ))}
      </section>
      <section className="space-y-2 rounded-2xl border border-ink-200 bg-white p-6 text-sm">
        <h2 className="font-semibold">Application Information</h2>
        <p>DRISHTI AI · Project SIH26038 · Team ShadYodha</p>
        <p className="text-ink-500">Explainable AI for Diabetic Retinopathy Screening in Rural India</p>
      </section>
      <section className="space-y-2 rounded-2xl border border-ink-200 bg-white p-6 text-sm">
        <h2 className="font-semibold">PWA Information</h2>
        <p>Install from the browser menu to use camps offline. Pending records sync automatically when connectivity returns.</p>
      </section>
      <Button
        className="w-full"
        onClick={() => {
          logout();
          router.push("/login");
        }}
      >
        Logout
      </Button>
    </div>
  );
}
