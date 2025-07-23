import { DashboardAnalyticsRepository, DashboardKPIs } from "@/repo/analytics/dashboard-analytics.repo";
import { User } from "@/lib/auth";

export class GetDashboardKPIsUsecase {
  constructor(private dashboardAnalyticsRepo: DashboardAnalyticsRepository) {}

  async execute(): Promise<DashboardKPIs> {
    return await this.dashboardAnalyticsRepo.getDashboardKPIs();
  }
}

export function createGetDashboardKPIsUsecase(user: User): GetDashboardKPIsUsecase {
  const dashboardAnalyticsRepo = new DashboardAnalyticsRepository(user);
  return new GetDashboardKPIsUsecase(dashboardAnalyticsRepo);
}