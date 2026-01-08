/*
 * Admin User Management Placeholder Page
 */

"use client"

import Link from "next/link"
import { useAdmin } from "@/hooks/use-admin"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export default function AdminUsersPage() {
  const { isAdmin, loading } = useAdmin()

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Loading...</p>
      </div>
    )
  }

  if (!isAdmin) {
    return null
  }

  return (
    <div className="container py-10">
      <h1 className="text-3xl font-bold mb-6">User Management</h1>
      <Card>
        <CardHeader>
          <CardTitle>Coming Soon</CardTitle>
          <CardDescription>
            A full-featured user management interface will appear here shortly.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="mb-4 text-sm text-gray-700">
            In the meantime, you can manage users directly from the Firebase console.
          </p>
          <Button asChild>
            <Link
              href="https://console.firebase.google.com/project/_/authentication/users"
              target="_blank"
              rel="noopener noreferrer"
            >
              Open Firebase Console
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
} 