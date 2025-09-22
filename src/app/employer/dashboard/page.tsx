import { createClient } from "@/lib/supabase/server"
import { EmployerLayout } from "@/components/layout/employer-layout"
import { StatsCard } from "@/components/dashboard/stats-card"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Users, Calendar, DollarSign, Clock, TrendingUp, AlertCircle } from "lucide-react"

export default async function EmployerDashboard() {
  const supabase = await createClient()

  // Get dashboard statistics
  const [{ count: totalEmployees }, { count: pendingLeaves }, { count: thisMonthPayroll }, { data: recentLeaves }] =
    await Promise.all([
      supabase.from("employees").select("*", { count: "exact", head: true }).eq("status", "active"),
      supabase.from("leave_requests").select("*", { count: "exact", head: true }).eq("status", "pending"),
      supabase
        .from("payroll_records")
        .select("*", { count: "exact", head: true })
        .gte("pay_period_start", new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString())
        .eq("status", "processed"),
      supabase
        .from("leave_requests")
        .select(
          `
        *,
        employees!inner(
          user_id,
          users!inner(full_name)
        ),
        leave_types(name)
      `,
        )
        .eq("status", "pending")
        .order("created_at", { ascending: false })
        .limit(5),
    ])

  return (
    <EmployerLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold cyber-text">Dashboard</h1>
          <p className="text-muted-foreground">Resumen general del sistema de recursos humanos</p>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatsCard
            title="Total Empleados"
            value={totalEmployees || 0}
            description="Empleados activos"
            icon={Users}
            trend={{ value: 5, isPositive: true }}
          />
          <StatsCard
            title="Licencias Pendientes"
            value={pendingLeaves || 0}
            description="Requieren aprobación"
            icon={Calendar}
            trend={{ value: -12, isPositive: false }}
          />
          <StatsCard
            title="Nóminas Procesadas"
            value={thisMonthPayroll || 0}
            description="Este mes"
            icon={DollarSign}
            trend={{ value: 8, isPositive: true }}
          />
          <StatsCard
            title="Tiempo Promedio"
            value="2.4h"
            description="Respuesta a solicitudes"
            icon={Clock}
            trend={{ value: -15, isPositive: true }}
          />
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Recent Leave Requests */}
          <Card className="cyber-border border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-primary" />
                Solicitudes de Licencia Pendientes
              </CardTitle>
              <CardDescription>Requieren tu aprobación</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentLeaves && recentLeaves.length > 0 ? (
                  recentLeaves.map((leave: any) => (
                    <div key={leave.id} className="flex items-center justify-between p-3 rounded-lg bg-secondary/20">
                      <div>
                        <p className="font-medium">{leave.employees.users.full_name}</p>
                        <p className="text-sm text-muted-foreground">
                          {leave.leave_types.name} - {leave.days_requested} días
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(leave.start_date).toLocaleDateString()} -{" "}
                          {new Date(leave.end_date).toLocaleDateString()}
                        </p>
                      </div>
                      <Badge variant="secondary" className="bg-yellow-500/20 text-yellow-400">
                        Pendiente
                      </Badge>
                    </div>
                  ))
                ) : (
                  <p className="text-muted-foreground text-center py-4">No hay solicitudes pendientes</p>
                )}
              </div>
            </CardContent>
          </Card>

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
              <div className="grid gap-3">
                <a
                  href="/employer/employees/new"
                  className="flex items-center p-3 rounded-lg bg-secondary/20 hover:bg-secondary/40 transition-colors"
                >
                  <Users className="h-5 w-5 text-primary mr-3" />
                  <div>
                    <p className="font-medium">Agregar Empleado</p>
                    <p className="text-sm text-muted-foreground">Registrar nuevo empleado</p>
                  </div>
                </a>
                <a
                  href="/employer/payroll/new"
                  className="flex items-center p-3 rounded-lg bg-secondary/20 hover:bg-secondary/40 transition-colors"
                >
                  <DollarSign className="h-5 w-5 text-primary mr-3" />
                  <div>
                    <p className="font-medium">Procesar Nómina</p>
                    <p className="text-sm text-muted-foreground">Generar recibos de sueldo</p>
                  </div>
                </a>
                <a
                  href="/employer/leaves"
                  className="flex items-center p-3 rounded-lg bg-secondary/20 hover:bg-secondary/40 transition-colors"
                >
                  <Calendar className="h-5 w-5 text-primary mr-3" />
                  <div>
                    <p className="font-medium">Revisar Licencias</p>
                    <p className="text-sm text-muted-foreground">Aprobar o rechazar solicitudes</p>
                  </div>
                </a>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </EmployerLayout>
  )
}
