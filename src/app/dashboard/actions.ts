import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { createGetDashboardKPIsUsecase } from "@/usecases/analytics/get-dashboard-kpis.usecase";
import { DashboardKPIs } from "@/repo/analytics/dashboard-analytics.repo";

export async function getDashboardKPIs(): Promise<DashboardKPIs> {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  const getDashboardKPIsUsecase = createGetDashboardKPIsUsecase(session.user);
  return await getDashboardKPIsUsecase.execute();
}