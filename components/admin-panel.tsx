"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RolesService, type UserRoleInfo, type RoleGrantLog } from "@/lib/roles"
import { Shield, Users, Activity, UserPlus, UserMinus, Clock, CheckCircle, XCircle, Crown, Star } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

interface AdminPanelProps {
  currentUserId?: string
}

export function AdminPanel({ currentUserId }: AdminPanelProps) {
  const [specialUsers, setSpecialUsers] = useState<UserRoleInfo[]>([])
  const [roleGrantsLog, setRoleGrantsLog] = useState<RoleGrantLog[]>([])
  const [loading, setLoading] = useState(true)
  const [grantRoleEmail, setGrantRoleEmail] = useState("")
  const [grantRoleType, setGrantRoleType] = useState<"super_user" | "admin">("super_user")
  const [grantRoleNotes, setGrantRoleNotes] = useState("")
  const [isGranting, setIsGranting] = useState(false)
  const [isRevoking, setIsRevoking] = useState<string | null>(null)
  const [revokeDialogOpen, setRevokeDialogOpen] = useState<string | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const [users, logs] = await Promise.all([RolesService.getAllSpecialUsers(), RolesService.getRoleGrantsLog()])
      setSpecialUsers(users)
      setRoleGrantsLog(logs)
    } catch (error) {
      console.error("Error loading admin data:", error)
      toast({
        title: "Error",
        description: "Failed to load admin data",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleGrantRole = async () => {
    if (!grantRoleEmail.trim()) {
      toast({
        title: "Error",
        description: "Please enter an email address",
        variant: "destructive",
      })
      return
    }

    try {
      setIsGranting(true)
      const result = await RolesService.grantRoleByEmail(grantRoleEmail, grantRoleType, grantRoleNotes)

      if (result.success) {
        toast({
          title: "Success",
          description: result.message,
        })
        setGrantRoleEmail("")
        setGrantRoleNotes("")
        await loadData()
      } else {
        toast({
          title: "Error",
          description: result.message,
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error granting role:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      })
    } finally {
      setIsGranting(false)
    }
  }

  const handleRevokeRole = async (userId: string, email: string) => {
    try {
      setIsRevoking(userId)
      const result = await RolesService.revokeUserRole(userId, "Role revoked by admin")

      if (result.success) {
        toast({
          title: "Success",
          description: `Successfully revoked special access for ${email}`,
        })
        await loadData()
      } else {
        toast({
          title: "Error",
          description: result.message,
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error revoking role:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      })
    } finally {
      setIsRevoking(null)
    }
  }

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case "admin":
        return "destructive"
      case "super_user":
        return "secondary"
      default:
        return "outline"
    }
  }

  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case "admin":
        return "Admin"
      case "super_user":
        return "Super User"
      default:
        return role
    }
  }

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "admin":
        return <Crown className="h-4 w-4" />
      case "super_user":
        return <Star className="h-4 w-4" />
      default:
        return null
    }
  }

  const getActionIcon = (action: string) => {
    switch (action) {
      case "granted":
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case "revoked":
        return <XCircle className="h-4 w-4 text-red-600" />
      case "expired":
        return <Clock className="h-4 w-4 text-orange-600" />
      default:
        return <Activity className="h-4 w-4" />
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString()
  }

  const isExpired = (expiresAt: string | null) => {
    if (!expiresAt) return false
    return new Date(expiresAt) <= new Date()
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Shield className="h-6 w-6 text-red-600" />
        <h1 className="text-2xl font-bold">Admin Panel</h1>
        <Badge variant="destructive" className="ml-2">
          Admin Access
        </Badge>
      </div>

      <Tabs defaultValue="users" className="space-y-4">
        <TabsList>
          <TabsTrigger value="users" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Special Users ({specialUsers.length})
          </TabsTrigger>
          <TabsTrigger value="logs" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Activity Log
          </TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserPlus className="h-5 w-5" />
                Grant Special Access
              </CardTitle>
              <CardDescription>
                Grant Super User (30-day unlimited access) or Admin privileges to users by email
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">User Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="user@example.com"
                    value={grantRoleEmail}
                    onChange={(e) => setGrantRoleEmail(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role">Role Type</Label>
                  <Select
                    value={grantRoleType}
                    onValueChange={(value: "super_user" | "admin") => setGrantRoleType(value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="super_user">Super User (30 days)</SelectItem>
                      <SelectItem value="admin">Admin (Permanent)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes">Notes (Optional)</Label>
                <Textarea
                  id="notes"
                  placeholder="Reason for granting access..."
                  value={grantRoleNotes}
                  onChange={(e) => setGrantRoleNotes(e.target.value)}
                />
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Shield className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div className="text-sm text-blue-800">
                    <p className="font-medium mb-1">Access Levels:</p>
                    <ul className="space-y-1">
                      <li>
                        <strong>Super User:</strong> Unlimited platform access for 30 days
                      </li>
                      <li>
                        <strong>Admin:</strong> Permanent unlimited access + admin panel access
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              <Button onClick={handleGrantRole} disabled={isGranting} className="w-full">
                {isGranting ? "Granting..." : `Grant ${getRoleDisplayName(grantRoleType)} Access`}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Current Special Users ({specialUsers.length})</CardTitle>
              <CardDescription>Users with Super User or Admin privileges</CardDescription>
            </CardHeader>
            <CardContent>
              {specialUsers.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No special users found</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Email</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Granted</TableHead>
                      <TableHead>Expires</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {specialUsers.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">{user.email}</TableCell>
                        <TableCell>
                          <Badge variant={getRoleBadgeVariant(user.role)} className="flex items-center gap-1 w-fit">
                            {getRoleIcon(user.role)}
                            {getRoleDisplayName(user.role)}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-gray-600">{formatDate(user.granted_at)}</TableCell>
                        <TableCell>
                          {user.expires_at ? (
                            <span
                              className={`text-sm ${isExpired(user.expires_at) ? "text-red-600" : "text-gray-600"}`}
                            >
                              {formatDate(user.expires_at)}
                            </span>
                          ) : (
                            <span className="text-sm text-green-600 font-medium">Never</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge variant={user.is_active && !isExpired(user.expires_at) ? "default" : "secondary"}>
                            {user.is_active && !isExpired(user.expires_at) ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {user.user_id !== currentUserId && user.is_active && !isExpired(user.expires_at) && (
                            <>
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-red-600 hover:text-red-700 bg-transparent"
                                onClick={() => setRevokeDialogOpen(user.user_id)}
                              >
                                <UserMinus className="h-4 w-4 mr-1" />
                                Revoke
                              </Button>
                              <Dialog open={revokeDialogOpen === user.user_id} onOpenChange={(open) => !open && setRevokeDialogOpen(null)}>
                                <DialogContent>
                                  <DialogHeader>
                                    <DialogTitle>Revoke Special Access</DialogTitle>
                                    <DialogDescription>
                                      Are you sure you want to revoke special access for <strong>{user.email}</strong>?
                                      This action cannot be undone.
                                    </DialogDescription>
                                  </DialogHeader>
                                  <div className="flex justify-end gap-2 mt-6">
                                    <Button variant="outline" onClick={() => setRevokeDialogOpen(null)}>
                                      Cancel
                                    </Button>
                                    <Button
                                      variant="destructive"
                                      onClick={() => {
                                        handleRevokeRole(user.user_id, user.email)
                                        setRevokeDialogOpen(null)
                                      }}
                                      disabled={isRevoking === user.user_id}
                                    >
                                      {isRevoking === user.user_id ? "Revoking..." : "Revoke Access"}
                                    </Button>
                                  </div>
                                </DialogContent>
                              </Dialog>
                            </>
                          )}
                          {user.user_id === currentUserId && <span className="text-sm text-gray-500">You</span>}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="logs" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Role Activity Log</CardTitle>
              <CardDescription>Recent role grants, revocations, and expirations</CardDescription>
            </CardHeader>
            <CardContent>
              {roleGrantsLog.length === 0 ? (
                <div className="text-center py-8">
                  <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No activity found</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Action</TableHead>
                      <TableHead>User</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Notes</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {roleGrantsLog.map((log) => (
                      <TableRow key={log.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getActionIcon(log.action)}
                            <span className="capitalize">{log.action}</span>
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">{log.email}</TableCell>
                        <TableCell>
                          <Badge variant={getRoleBadgeVariant(log.role)} className="flex items-center gap-1 w-fit">
                            {getRoleIcon(log.role)}
                            {getRoleDisplayName(log.role)}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-gray-600">{formatDate(log.created_at)}</TableCell>
                        <TableCell>
                          <span className="text-sm text-gray-600">{log.notes || "—"}</span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
