import type { ReactNode } from "react";
import { redirect } from "next/navigation";

import AppNavbar from "@/components/layout/AppNavbar";
import AppFooter from "@/components/layout/AppFooter";
import SessionActivityMonitor from "@/components/layout/SessionActivityMonitor";
import { getCurrentUser } from "@/lib/auth";

export default async function AppRouteLayout({
  children,
}: {
  children: ReactNode;
}) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="app-layout">
      <SessionActivityMonitor />
      <AppNavbar />

      <main className="app-main">
        {children}
      </main>

      <AppFooter />
    </div>
  );
}
