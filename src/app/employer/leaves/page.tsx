import { createClient } from "@/lib/supabase/server"
import { EmployerLayout } from "@/components/layout/employer-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { LeaveApprovalForm } from "@/components/forms/leave-approval-form"
import { Calendar, Clock, CheckCircle, XCircle, User } from "lucide-react"

export default async function EmployerLeavesPage() {
  const supabase = await createClient()

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null

  const { data: leaveRequests } = await supabase
    .from("leave_requests")
    .select(
      `
      *,
      employees!inner(
        employee_id,
        users!inner(full_name, email)
      ),
      leave_types(name, description)
    `,
    )
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
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-full bg-primary/20">
              <User className="h-4 w-4 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg">{leave.employees.users.full_name}</CardTitle>
              <CardDescription>ID: {leave.employees.employee_id}</CardDescription>
            </div>
          </div>
          {getStatusBadge(leave.status)}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Tipo de Licencia</p>
            <p className="font-medium">{leave.leave_types.name}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Días Solicitados</p>
            <p className="font-medium">{leave.days_requested} días</p>
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
        <div>
          <p className="text-sm text-muted-foreground">Solicitado el</p>
          <p className="text-sm">{new Date(leave.created_at).toLocaleString()}</p>
        </div>
        {leave.status === "pending" && (
          <LeaveApprovalForm
            leaveRequestId={leave.id}
            approverId={user.id}
            employeeName={leave.employees.users.full_name}
            leaveType={leave.leave_types.name}
          />
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
    <EmployerLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold cyber-text">Gestión de Licencias</h1>
          <p className="text-muted-foreground">Revisa y gestiona las solicitudes de licencia de tus empleados</p>
        </div>

        <Tabs defaultValue="pending" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 cyber-border">
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
                  <Calendar className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">No hay solicitudes pendientes</h3>
                  <p className="text-muted-foreground">Todas las solicitudes han sido procesadas.</p>
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
                  <h3 className="text-lg font-medium mb-2">No hay licencias aprobadas</h3>
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
                  <h3 className="text-lg font-medium mb-2">No hay licencias rechazadas</h3>
                  <p className="text-muted-foreground">Las licencias rechazadas aparecerán aquí.</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </EmployerLayout>
  )
}