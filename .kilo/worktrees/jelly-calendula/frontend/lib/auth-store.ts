import { create } from "zustand";
import { persist } from "zustand/middleware";
import { StaffRole } from "@/exports";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: string;
  access_token?: string;
}

interface AuthState {
  accessToken: string | null;
  user: AuthUser | null;
  setSession: (accessToken: string, user: AuthUser) => void;
  clearSession: () => void;
}

// Backend `user.role` values → frontend StaffRole dashboards.
export const BACKEND_ROLE_TO_STAFF_ROLE: Record<string, StaffRole> = {
  Admin: "ADMINISTRATOR",
  "Primary-HeadMaster": "HEADMASTER_PRIMARY",
  "Secondary-HeadMaster": "HEADMASTER_SECONDARY_TVET",
  "DOS-Secondary": "DOS_SECONDARY",
  "DOS-Tvet": "DOS_TVET",
  Bursar: "BURSAR",
  Cashier: "CASHIER",
  "Store-Manager": "STORE_MANAGER",
  "School-receptionist": "REQUIREMENT_COLLECTOR",
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      accessToken: null,
      user: null,
      setSession: (accessToken, user) => set({ accessToken, user }),
      clearSession: () => set({ accessToken: null, user: null }),
    }),
    { name: "auth-store" },
  ),
);
