"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth-store";

export default function Home() {
  const router = useRouter();
  const session = useAuthStore((s) => s.session);
  useEffect(() => {
    router.replace(session ? "/dashboard" : "/login");
  }, [router, session]);
  return (
    <div className="grid min-h-screen place-items-center bg-ink-50">
      <div className="text-center">
        <div className="mx-auto h-12 w-12 animate-spin rounded-full border-2 border-ink-200 border-t-ink-900" />
        <p className="mt-4 text-sm text-ink-500">DRISHTI AI</p>
      </div>
    </div>
  );
}
