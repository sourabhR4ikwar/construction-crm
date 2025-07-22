"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { UserRole } from "@/lib/auth-utils"
import Link from "next/link"

interface DashboardClientProps {
  userRole: UserRole
}

export function DashboardClient({ userRole }: DashboardClientProps) {
  const isAdmin = userRole === "admin"
  const isStaff = userRole === "admin" || userRole === "staff"

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {/* Projects - Available to all authenticated users */}
      <Card>
        <CardHeader>
          <CardTitle>Projects</CardTitle>
          <CardDescription>
            View and manage construction projects
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Link href="/projects">
            <Button className="w-full">View Projects</Button>
          </Link>
        </CardContent>
      </Card>

      {/* Companies & Contacts - Available to all authenticated users */}
      <Card>
        <CardHeader>
          <CardTitle>Companies & Contacts</CardTitle>
          <CardDescription>
            Manage companies and their contacts
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Link href="/companies">
            <Button className="w-full">View Companies</Button>
          </Link>
        </CardContent>
      </Card>

      {/* Create New Project - Staff and Admin only */}
      {isStaff && (
        <Card>
          <CardHeader>
            <CardTitle>Create Project</CardTitle>
            <CardDescription>
              Start a new construction project
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/projects/new">
              <Button className="w-full" variant="secondary">
                New Project
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}

      {/* User Management - Admin only */}
      {isAdmin && (
        <Card className="border-destructive/50">
          <CardHeader>
            <CardTitle>User Management</CardTitle>
            <CardDescription>
              Manage users and their permissions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/admin/users">
              <Button className="w-full" variant="destructive">
                Manage Users
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}

      {/* Reports - Staff and Admin */}
      {isStaff && (
        <Card>
          <CardHeader>
            <CardTitle>Reports</CardTitle>
            <CardDescription>
              Generate and view project reports
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/reports">
              <Button className="w-full" variant="outline">
                View Reports
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}

      {/* Settings - Admin only */}
      {isAdmin && (
        <Card>
          <CardHeader>
            <CardTitle>System Settings</CardTitle>
            <CardDescription>
              Configure system-wide settings
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/admin/settings">
              <Button className="w-full" variant="outline">
                Settings
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  )
}