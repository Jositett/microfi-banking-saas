import { AdminHeader } from "@/components/admin/admin-header"
import { AdminSidebar } from "@/components/admin/admin-sidebar"
import { UsersList } from "@/components/admin/users-list"
import { UserActions } from "@/components/admin/user-actions"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"

export default function AdminUsersPage() {
  return (
    <div className="flex h-screen bg-background">
      <AdminSidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        <AdminHeader />

        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-foreground">User Management</h1>
                <p className="text-muted-foreground">Manage user accounts and permissions</p>
              </div>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add User
              </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              <div className="lg:col-span-3">
                <UsersList />
              </div>
              <div>
                <UserActions />
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
