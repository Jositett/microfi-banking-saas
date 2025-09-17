import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { MoreHorizontal, Search } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

const users = [
  {
    id: "1",
    name: "John Doe",
    email: "john.doe@example.com",
    phone: "+233 24 123 4567",
    role: "customer",
    status: "active",
    accounts: 2,
    balance: 15234.56,
    joinDate: "2024-01-15",
    lastLogin: "2024-01-20",
  },
  {
    id: "2",
    name: "Jane Smith",
    email: "jane.smith@example.com",
    phone: "+233 24 234 5678",
    role: "business",
    status: "active",
    accounts: 3,
    balance: 45678.9,
    joinDate: "2023-11-20",
    lastLogin: "2024-01-19",
  },
  {
    id: "3",
    name: "Mike Johnson",
    email: "mike.johnson@example.com",
    phone: "+233 24 345 6789",
    role: "teller",
    status: "active",
    accounts: 0,
    balance: 0,
    joinDate: "2023-08-10",
    lastLogin: "2024-01-20",
  },
  {
    id: "4",
    name: "Sarah Wilson",
    email: "sarah.wilson@example.com",
    phone: "+233 24 456 7890",
    role: "customer",
    status: "inactive",
    accounts: 1,
    balance: 2500.0,
    joinDate: "2023-12-05",
    lastLogin: "2024-01-10",
  },
  {
    id: "5",
    name: "David Brown",
    email: "david.brown@example.com",
    phone: "+233 24 567 8901",
    role: "admin",
    status: "active",
    accounts: 0,
    balance: 0,
    joinDate: "2023-01-01",
    lastLogin: "2024-01-20",
  },
]

export function UsersList() {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800"
      case "inactive":
        return "bg-gray-100 text-gray-800"
      case "suspended":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-red-100 text-red-800"
      case "teller":
        return "bg-blue-100 text-blue-800"
      case "business":
        return "bg-purple-100 text-purple-800"
      case "customer":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Users</CardTitle>
        <CardDescription>Manage all system users and their permissions</CardDescription>

        {/* Filters */}
        <div className="flex items-center space-x-4 pt-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input placeholder="Search users..." className="pl-10" />
          </div>
          <Select>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Roles</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
              <SelectItem value="teller">Teller</SelectItem>
              <SelectItem value="business">Business</SelectItem>
              <SelectItem value="customer">Customer</SelectItem>
            </SelectContent>
          </Select>
          <Select>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
              <SelectItem value="suspended">Suspended</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {users.map((user) => (
            <div
              key={user.id}
              className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center space-x-4">
                <Avatar className="h-10 w-10">
                  <AvatarImage src="/placeholder.svg?key=user" alt={user.name} />
                  <AvatarFallback>
                    {user.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <h3 className="font-medium">{user.name}</h3>
                    <Badge className={getRoleColor(user.role)}>{user.role}</Badge>
                    <Badge className={getStatusColor(user.status)}>{user.status}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{user.email}</p>
                  <p className="text-xs text-muted-foreground">{user.phone}</p>
                </div>
              </div>

              <div className="flex items-center space-x-6 text-sm">
                <div className="text-center">
                  <p className="font-medium">{user.accounts}</p>
                  <p className="text-xs text-muted-foreground">Accounts</p>
                </div>
                <div className="text-center">
                  <p className="font-medium">₵{user.balance.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">Balance</p>
                </div>
                <div className="text-center">
                  <p className="font-medium">{new Date(user.joinDate).toLocaleDateString()}</p>
                  <p className="text-xs text-muted-foreground">Joined</p>
                </div>
                <div className="text-center">
                  <p className="font-medium">{new Date(user.lastLogin).toLocaleDateString()}</p>
                  <p className="text-xs text-muted-foreground">Last Login</p>
                </div>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>View Profile</DropdownMenuItem>
                    <DropdownMenuItem>Edit User</DropdownMenuItem>
                    <DropdownMenuItem>Change Role</DropdownMenuItem>
                    <DropdownMenuItem>Reset Password</DropdownMenuItem>
                    <DropdownMenuItem className="text-red-600">Suspend User</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
