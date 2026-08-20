"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  BACKEND_ROLE_TO_STAFF_ROLE,
  useAuthStore,
} from "@/lib/auth-store";
import { ROLE_REDIRECT_MAP, StaffRole } from "@/exports";

// Dashboard URL segment → the StaffRole that is allowed to view it.
const ROLE_SEGMENT_TO_STAFF_ROLE: Record<string, StaffRole> = {
  administrator: "ADMINISTRATOR",
  "headmaster-primary": "HEADMASTER_PRIMARY",
  "headmaster-secondary-tvet": "HEADMASTER_SECONDARY_TVET",
  "dos-secondary": "DOS_SECONDARY",
  "dos-tvet": "DOS_TVET",
  bursar: "BURSAR",
  cashier: "CASHIER",
  "store-manager": "STORE_MANAGER",
  "requirement-collector": "REQUIREMENT_COLLECTOR",
};

export default function AuthGuard({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [isHydrated, setIsHydrated] = useState(false);

  const user = useAuthStore((state) => state.user);
  const accessToken = useAuthStore((state) => state.accessToken);

  // Wait for Zustand persist middleware to rehydrate state from localStorage before checking auth
  useEffect(() => {
    // Check if store is already hydrated or subscribe to rehydration
    const unsub = useAuthStore.persist.onFinishHydration(() => {
      setIsHydrated(true);
    });

    if (useAuthStore.persist.hasHydrated()) {
      setIsHydrated(true);
    }

    return () => {
      unsub();
    };
  }, []);

  const isAuthenticated = Boolean(accessToken && user);

  useEffect(() => {
    // DO NOT run auth redirect checks until localStorage hydration is complete!
    if (!isHydrated) return;

    // 1. Not logged in → send to the login page.
    if (!isAuthenticated) {
      router.replace("/staff-portal-v1");
      return;
    }

    if (!user) return;

    const staffRole = BACKEND_ROLE_TO_STAFF_ROLE[user.role];
    const ownDashboard = staffRole ? ROLE_REDIRECT_MAP[staffRole] : undefined;

    // 2. On the generic /dashboard hub → go straight to your own dashboard.
    if (pathname === "/dashboard" || pathname === "/dashboard/") {
      if (ownDashboard && pathname !== ownDashboard) {
        router.replace(ownDashboard);
      }
      return;
    }

    // 3. Role mismatch → redirect to the user's own dashboard.
    const segment = pathname.split("/")[2] ?? "";
    const requiredRole = ROLE_SEGMENT_TO_STAFF_ROLE[segment];
    if (requiredRole && staffRole && requiredRole !== staffRole) {
      router.replace(ownDashboard ?? "/staff-portal-v1");
    }
  }, [isHydrated, isAuthenticated, pathname, user, router]);

  // Show loading indicator or blank while rehydrating from localStorage to prevent flash
  if (!isHydrated || !isAuthenticated) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-950 text-zinc-500 text-xs font-bold">
        <span>Restoring session...</span>
      </div>
    );
  }

  return <>{children}</>;
}
