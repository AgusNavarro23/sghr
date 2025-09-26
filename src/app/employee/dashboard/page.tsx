import { createClient } from "@/lib/supabase/server"
import { EmployeeLayout } from "@/components/layout/employee-layout"
import { StatsCard } from "@/components/dashboard/stats-card"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, DollarSign, Clock, TrendingUp, Plus, FileText, User } from "lucide-react"
import Link from "next/link"

export default async function EmployeeDashboard() {
  const supabase = await createClient()

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null

  // Get employee data
  const { data: employee } = await supabase.from("employees").select("*").eq("user_id", user.id).single()

  if (!employee) return null

  // Get dashboard statistics
  const [
    { count: totalLeaves },
    { count: pendingLeaves },
    { count: thisYearPayroll },
    { data: recentLeaves },
    { data: recentPayroll },
  ] = await Promise.all([
    supabase.from("leave_requests").select("*", { count: "exact", head: true }).eq("employee_id", employee.id),
    supabase
      .from("leave_requests")
      .select("*", { count: "exact", head: true })
      .eq("employee_id", employee.id)
      .eq("status", "pending"),
    supabase
      .from("payslips")
      .select("*", { count: "exact", head: true })
      .eq("employee_id", employee.id)
,    supabase
      .from("leave_requests")
      .select(`
        *,
        leave_types(name)
      `)
      .eq("employee_id", employee.id)
      .order("created_at", { ascending: false })
      .limit(3),
    supabase
      .from("payslips")
      .select("*")
      .eq("employee_id", employee.id)
      .order("created_at", { ascending: false })
      .limit(3),
  ])

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <Badge variant="secondary" className="bg-yellow-500/20 text-yellow-400">
            Pendiente
          </Badge>
        )
      case "approved":
        return (
          <Badge variant="secondary" className="bg-green-500/20 text-green-400">
            Aprobada
          </Badge>
        )
      case "rejected":
        return (
          <Badge variant="secondary" className="bg-red-500/20 text-red-400">
            Rechazada
          </Badge>
        )
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }
  function nombreMesEs(m: number) {
  const d = new Date(2000, m - 1, 1);
  return new Intl.DateTimeFormat("es-AR", { month: "long" }).format(d);
}

  return (
    <EmployeeLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold cyber-text">Mi Dashboard</h1>
          <p className="text-muted-foreground">Bienvenido de vuelta, aquí tienes un resumen de tu información</p>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatsCard title="Licencias Totales" value={totalLeaves || 0} description="Este año" icon={Calendar} />
          <StatsCard
            title="Licencias Pendientes"
            value={pendingLeaves || 0}
            description="Esperando aprobación"
            icon={Clock}
          />
          <StatsCard title="Recibos de Sueldo" value={thisYearPayroll || 0} description="Este año" icon={DollarSign} />
          <StatsCard title="Días Disponibles" value="18" description="Vacaciones restantes" icon={TrendingUp} />
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Recent Leave Requests */}
          <Card className="cyber-border border-primary/20">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-primary" />
                    Mis Licencias Recientes
                  </CardTitle>
                  <CardDescription>Últimas solicitudes de licencia</CardDescription>
                </div>
                <Button asChild size="sm" className="cyber-glow">
                  <Link href="/employee/leaves/new">
                    <Plus className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentLeaves && recentLeaves.length > 0 ? (
                  recentLeaves.map((leave: any) => (
                    <div key={leave.id} className="flex items-center justify-between p-3 rounded-lg bg-secondary/20">
                      <div>
                        <p className="font-medium">{leave.leave_types.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {leave.days_requested} días - {new Date(leave.start_date).toLocaleDateString()} al{" "}
                          {new Date(leave.end_date).toLocaleDateString()}
                        </p>
                      </div>
                      {getStatusBadge(leave.status)}
                    </div>
                  ))
                ) : (
                  <p className="text-muted-foreground text-center py-4">No tienes solicitudes de licencia</p>
                )}
              </div>
              <div className="mt-4">
                <Button asChild variant="outline" className="w-full cyber-border bg-transparent">
                  <Link href="/employee/leaves">Ver Todas las Licencias</Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Recent Payroll */}
          <Card className="cyber-border border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-primary" />
                Recibos de Sueldo Recientes
              </CardTitle>
              <CardDescription>Últimos recibos procesados</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentPayroll && recentPayroll.length > 0 ? (
                  recentPayroll.map((payroll: any) => (
                    <div key={payroll.id} className="flex items-center justify-between p-3 rounded-lg bg-secondary/20">
                      <div>
                        <p className="font-medium">
                          Año: {payroll.year} - Mes: {nombreMesEs(payroll.month).toUpperCase()}
                        </p>
                      </div>
                      <Badge
                        variant="secondary"
                        className="bg-green-500/20 text-green-400"
                      >
                        Pagado
                      </Badge>
                    </div>
                  ))
                ) : (
                  <p className="text-muted-foreground text-center py-4">No tienes recibos de sueldo</p>
                )}
              </div>
              <div className="mt-4">
                <Button asChild variant="outline" className="w-full cyber-border bg-transparent">
                  <Link href="/employee/payroll">Ver Todos los Recibos</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="cyber-border border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Acciones Rápidas
            </CardTitle>
            <CardDescription>Tareas frecuentes</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 md:grid-cols-3">
              <Link
                href="/employee/leaves/new"
                className="flex items-center p-4 rounded-lg bg-secondary/20 hover:bg-secondary/40 transition-colors"
              >
                <Calendar className="h-6 w-6 text-primary mr-3" />
                <div>
                  <p className="font-medium">Solicitar Licencia</p>
                  <p className="text-sm text-muted-foreground">Nueva solicitud</p>
                </div>
              </Link>
              <Link
                href="/employee/payroll"
                className="flex items-center p-4 rounded-lg bg-secondary/20 hover:bg-secondary/40 transition-colors"
              >
                <FileText className="h-6 w-6 text-primary mr-3" />
                <div>
                  <p className="font-medium">Ver Recibos</p>
                  <p className="text-sm text-muted-foreground">Historial de pagos</p>
                </div>
              </Link>
              <Link
                href="/employee/profile"
                className="flex items-center p-4 rounded-lg bg-secondary/20 hover:bg-secondary/40 transition-colors"
              >
                <User className="h-6 w-6 text-primary mr-3" />
                <div>
                  <p className="font-medium">Mi Perfil</p>
                  <p className="text-sm text-muted-foreground">Actualizar información</p>
                </div>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </EmployeeLayout>
  )
}