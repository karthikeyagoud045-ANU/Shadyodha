"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { AuthSession, UserRole } from "@/types";
import { authService } from "@/services/authService";

interface AuthState {
  session: AuthSession | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string, role?: UserRole) => Promise<void>;
  demoLogin: (role: UserRole) => Promise<void>;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      session: null,
      loading: false,
      error: null,
      login: async (email, password, role) => {
        set({ loading: true, error: null });
        try {
          const session = await authService.login(email, password, role);
          localStorage.setItem("drishti.token", session.token);
          document.cookie = `drishti_auth=1; path=/; max-age=${60 * 60 * 8}`;
          set({ session, loading: false });
        } catch (e) {
          set({ loading: false, error: e instanceof Error ? e.message : "Sign in failed." });
          throw e;
        }
      },
      demoLogin: async (role) => {
        set({ loading: true, error: null });
        const session = await authService.demoLogin(role);
        localStorage.setItem("drishti.token", session.token);
        document.cookie = `drishti_auth=1; path=/; max-age=${60 * 60 * 8}`;
        set({ session, loading: false });
      },
      logout: () => {
        localStorage.removeItem("drishti.token");
        document.cookie = "drishti_auth=; path=/; max-age=0";
        set({ session: null, error: null });
      },
    }),
    { name: "drishti.session" },
  ),
);
