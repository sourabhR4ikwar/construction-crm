import { BaseRepository } from "../base.repo";
import { db } from "@/lib/db";
import { project, projectInteraction, contact } from "@/lib/db/schema";
import { eq, count, sql, and, gte, lte, desc } from "drizzle-orm";
import { User } from "@/lib/auth";

export interface DashboardKPIs {
  activeProjectsCount: number;
  totalBudget: number;
  upcomingDeadlines: Array<{
    id: string;
    title: string;
    endDate: Date;
    status: string;
    stage: string;
  }>;
  recentActivities: Array<{
    id: string;
    type: string;
    summary: string;
    projectTitle: string;
    interactionDate: Date;
    createdBy: string;
  }>;
  projectsByStage: Array<{
    stage: string;
    count: number;
  }>;
  projectsByStatus: Array<{
    status: string;
    count: number;
  }>;
  budgetOverview: {
    totalBudget: number;
    averageBudget: number;
    budgetByStage: Array<{
      stage: string;
      totalBudget: number;
    }>;
  };
}

export class DashboardAnalyticsRepository extends BaseRepository {
  constructor(user: User) {
    super(user);
  }

  async getDashboardKPIs(): Promise<DashboardKPIs> {
    // Get active projects count
    const [activeProjectsResult] = await db
      .select({ count: count() })
      .from(project)
      .where(eq(project.status, "active"));

    // Get total budget
    const [totalBudgetResult] = await db
      .select({ total: sql<number>`COALESCE(SUM(${project.budget}), 0)` })
      .from(project);

    // Get upcoming deadlines (projects ending within 30 days)
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

    const upcomingDeadlines = await db
      .select({
        id: project.id,
        title: project.title,
        endDate: project.endDate,
        status: project.status,
        stage: project.stage,
      })
      .from(project)
      .where(
        and(
          gte(project.endDate, new Date()),
          lte(project.endDate, thirtyDaysFromNow),
          eq(project.status, "active")
        )
      )
      .orderBy(project.endDate)
      .limit(10);

    // Get recent activities (last 10 interactions)
    const recentActivities = await db
      .select({
        id: projectInteraction.id,
        type: projectInteraction.type,
        summary: projectInteraction.summary,
        projectTitle: project.title,
        interactionDate: projectInteraction.interactionDate,
        createdBy: sql<string>`COALESCE(${contact.name}, 'System')`,
      })
      .from(projectInteraction)
      .leftJoin(project, eq(projectInteraction.projectId, project.id))
      .leftJoin(contact, eq(projectInteraction.contactId, contact.id))
      .orderBy(desc(projectInteraction.interactionDate))
      .limit(10);

    // Get projects by stage
    const projectsByStage = await db
      .select({
        stage: project.stage,
        count: count(),
      })
      .from(project)
      .groupBy(project.stage);

    // Get projects by status
    const projectsByStatus = await db
      .select({
        status: project.status,
        count: count(),
      })
      .from(project)
      .groupBy(project.status);

    // Get budget overview
    const [averageBudgetResult] = await db
      .select({ 
        average: sql<number>`COALESCE(AVG(${project.budget}), 0)`,
        count: count()
      })
      .from(project)
      .where(sql`${project.budget} IS NOT NULL AND ${project.budget} > 0`);

    const budgetByStage = await db
      .select({
        stage: project.stage,
        totalBudget: sql<number>`COALESCE(SUM(${project.budget}), 0)`,
      })
      .from(project)
      .groupBy(project.stage);

    return {
      activeProjectsCount: activeProjectsResult.count,
      totalBudget: totalBudgetResult.total,
      upcomingDeadlines: upcomingDeadlines.map(deadline => ({
        ...deadline,
        endDate: deadline.endDate!,
      })),
      recentActivities: recentActivities.map(activity => ({
        ...activity,
        createdBy: activity.createdBy || 'System',
      })),
      projectsByStage: projectsByStage.map(stage => ({
        stage: stage.stage,
        count: stage.count,
      })),
      projectsByStatus: projectsByStatus.map(status => ({
        status: status.status,
        count: status.count,
      })),
      budgetOverview: {
        totalBudget: totalBudgetResult.total,
        averageBudget: averageBudgetResult.average,
        budgetByStage: budgetByStage.map(stage => ({
          stage: stage.stage,
          totalBudget: stage.totalBudget,
        })),
      },
    };
  }
}