import api, { USE_MOCK } from "./api";
import { DEMO_USERS } from "./seed";
import { delay } from "@/lib/utils";
import type { AuthSession, UserRole } from "@/types";

function tokenFor(email: string) {
  return `demo.${btoa(email)}.${Date.now()}`;
}

export const authService = {
  async login(email: string, password: string, role?: UserRole): Promise<AuthSession> {
    if (USE_MOCK) {
      await delay(500);
      const rec = DEMO_USERS[email.toLowerCase()];
      if (rec && rec.password === password) {
        const user = role ? { ...rec.user, role } : rec.user;
        return {
          user,
          token: tokenFor(user.email),
          expiresAt: new Date(Date.now() + 8 * 3600_000).toISOString(),
        };
      }
      if (role) {
        const any = Object.values(DEMO_USERS).find((u) => u.user.role === role);
        if (any) {
          return {
            user: any.user,
            token: tokenFor(any.user.email),
            expiresAt: new Date(Date.now() + 8 * 3600_000).toISOString(),
          };
        }
      }
      throw new Error("Invalid email or password.");
    }

    const { data: resBody } = await api.post("/auth/login", { email, password, role });
    const payload = resBody?.data || resBody;
    const u = payload.user || {};
    return {
      token: payload.token,
      user: {
        id: u._id || u.id || "usr-1",
        name: u.name || email,
        email: u.email || email,
        role: (u.role as UserRole) || role || "health_worker",
        facility: u.facility || "District Tele-Ophthalmology Center",
        district: u.district || "Gajapati",
      },
      expiresAt: new Date(Date.now() + 8 * 3600_000).toISOString(),
    };
  },

  async demoLogin(role: UserRole): Promise<AuthSession> {
    const map: Record<UserRole, { email: string; pass: string }> = {
      health_worker: { email: "asha1@drishti.ai", pass: "Worker@123" },
      ophthalmologist: { email: "doc1@drishti.ai", pass: "Doctor@123" },
      admin: { email: "admin@drishti.ai", pass: "Admin@123" },
      patient: { email: "patient@drishti.ai", pass: "demo123" },
    };
    const target = map[role] || { email: "asha1@drishti.ai", pass: "Worker@123" };
    try {
      return await this.login(target.email, target.pass, role);
    } catch {
      // Fallback to local demo session if backend isn't running or credentials differ
      const rec = DEMO_USERS[`${role}@drishti.ai`] || Object.values(DEMO_USERS).find((u) => u.user.role === role);
      if (rec) {
        return {
          user: { ...rec.user, role },
          token: tokenFor(rec.user.email),
          expiresAt: new Date(Date.now() + 8 * 3600_000).toISOString(),
        };
      }
      throw new Error("Demo login unavailable.");
    }
  },
};
