import { createClient } from "@/lib/supabase/server"
import { EmployeeLayout } from "@/components/layout/employee-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar, Clock, CheckCircle, XCircle, Plus } from "lucide-react"
import Link from "next/link"

export default async function EmployeeLeavesPage() {
  const supabase = await createClient()

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null

  // Get employee data
  const { data: employee } = await supabase.from("employees").select("*").eq("user_id", user.id).single()

  if (!employee) return null

  const { data: leaveRequests } = await supabase
    .from("leave_requests")
    .select(`
      *,
      leave_types(name, description)
    `)
    .eq("employee_id", employee.id)
    .order("created_at", { ascending: false })

  const pendingLeaves = leaveRequests?.filter((leave) => leave.status === "pending") || []
  const approvedLeaves = leaveRequests?.filter((leave) => leave.status === "approved") || []
  const rejectedLeaves = leaveRequests?.filter((leave) => leave.status === "rejected") || []

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <Badge variant="secondary" className="bg-yellow-500/20 text-yellow-400">
            <Clock className="mr-1 h-3 w-3" />
            Pendiente
          </Badge>
        )
      case "approved":
        return (
          <Badge variant="secondary" className="bg-green-500/20 text-green-400">
            <CheckCircle className="mr-1 h-3 w-3" />
            Aprobada
          </Badge>
        )
      case "rejected":
        return (
          <Badge variant="secondary" className="bg-red-500/20 text-red-400">
            <XCircle className="mr-1 h-3 w-3" />
            Rechazada
          </Badge>
        )
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const LeaveRequestCard = ({ leave }: { leave: any }) => (
    <Card className="cyber-border border-primary/20 hover:cyber-glow transition-all duration-300">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">{leave.leave_types.name}</CardTitle>
            <CardDescription>{leave.leave_types.description}</CardDescription>
          </div>
          {getStatusBadge(leave.status)}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Días Solicitados</p>
            <p className="font-medium">{leave.days_requested} días</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Fecha de Solicitud</p>
            <p className="font-medium">{new Date(leave.created_at).toLocaleDateString()}</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Fecha Inicio</p>
            <p className="font-medium">{new Date(leave.start_date).toLocaleDateString()}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Fecha Fin</p>
            <p className="font-medium">{new Date(leave.end_date).toLocaleDateString()}</p>
          </div>
        </div>
        {leave.reason && (
          <div>
            <p className="text-sm text-muted-foreground">Motivo</p>
            <p className="text-sm bg-secondary/20 p-2 rounded">{leave.reason}</p>
          </div>
        )}
        {leave.status === "rejected" && leave.rejection_reason && (
          <div>
            <p className="text-sm text-muted-foreground">Motivo del Rechazo</p>
            <p className="text-sm bg-destructive/20 p-2 rounded text-destructive-foreground">
              {leave.rejection_reason}
            </p>
          </div>
        )}
        {leave.approved_at && (
          <div>
            <p className="text-sm text-muted-foreground">
              {leave.status === "approved" ? "Aprobada el" : "Procesada el"}
            </p>
            <p className="text-sm">{new Date(leave.approved_at).toLocaleString()}</p>
          </div>
        )}
      </CardContent>
    </Card>
  )

  return (
    <EmployeeLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold cyber-text">Mis Licencias</h1>
            <p className="text-muted-foreground">Gestiona tus solicitudes de licencia</p>
          </div>
          <Button asChild className="cyber-glow">
            <Link href="/employee/leaves/new">
              <Plus className="mr-2 h-4 w-4" />
              Nueva Solicitud
            </Link>
          </Button>
        </div>

        <Tabs defaultValue="all" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 cyber-border">
            <TabsTrigger value="all" className="data-[state=active]:cyber-glow">
              Todas ({leaveRequests?.length || 0})
            </TabsTrigger>
            <TabsTrigger value="pending" className="data-[state=active]:cyber-glow">
              Pendientes ({pendingLeaves.length})
            </TabsTrigger>
            <TabsTrigger value="approved" className="data-[state=active]:cyber-glow">
              Aprobadas ({approvedLeaves.length})
            </TabsTrigger>
            <TabsTrigger value="rejected" className="data-[state=active]:cyber-glow">
              Rechazadas ({rejectedLeaves.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4">
            {leaveRequests && leaveRequests.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2">
                {leaveRequests.map((leave) => (
                  <LeaveRequestCard key={leave.id} leave={leave} />
                ))}
              </div>
            ) : (
              <Card className="cyber-border border-primary/20">
                <CardContent className="text-center py-12">
                  <Calendar className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">No tienes solicitudes de licencia</h3>
                  <p className="text-muted-foreground mb-4">Comienza creando tu primera solicitud.</p>
                  <Button asChild className="cyber-glow">
                    <Link href="/employee/leaves/new">
                      <Plus className="mr-2 h-4 w-4" />
                      Nueva Solicitud
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="pending" className="space-y-4">
            {pendingLeaves.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2">
                {pendingLeaves.map((leave) => (
                  <LeaveRequestCard key={leave.id} leave={leave} />
                ))}
              </div>
            ) : (
              <Card className="cyber-border border-primary/20">
                <CardContent className="text-center py-12">
                  <Clock className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">No tienes solicitudes pendientes</h3>
                  <p className="text-muted-foreground">Todas tus solicitudes han sido procesadas.</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="approved" className="space-y-4">
            {approvedLeaves.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2">
                {approvedLeaves.map((leave) => (
                  <LeaveRequestCard key={leave.id} leave={leave} />
                ))}
              </div>
            ) : (
              <Card className="cyber-border border-primary/20">
                <CardContent className="text-center py-12">
                  <CheckCircle className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">No tienes licencias aprobadas</h3>
                  <p className="text-muted-foreground">Las licencias aprobadas aparecerán aquí.</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="rejected" className="space-y-4">
            {rejectedLeaves.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2">
                {rejectedLeaves.map((leave) => (
                  <LeaveRequestCard key={leave.id} leave={leave} />
                ))}
              </div>
            ) : (
              <Card className="cyber-border border-primary/20">
                <CardContent className="text-center py-12">
                  <XCircle className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">No tienes licencias rechazadas</h3>
                  <p className="text-muted-foreground">Las licencias rechazadas aparecerán aquí.</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </EmployeeLayout>
  )
}