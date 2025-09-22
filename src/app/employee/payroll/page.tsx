import { createClient } from "@/lib/supabase/server"
import { EmployeeLayout } from "@/components/layout/employee-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { DollarSign, Download, Eye, TrendingUp } from "lucide-react"

export default async function EmployeePayrollPage() {
  const supabase = await createClient()

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null

  // Get employee data
  const { data: employee } = await supabase.from("employees").select("*").eq("user_id", user.id).single()

  if (!employee) return null

  const { data: payrollRecords } = await supabase
    .from("payroll_records")
    .select("*")
    .eq("employee_id", employee.id)
    .order("created_at", { ascending: false })

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "draft":
        return (
          <Badge variant="secondary" className="bg-gray-500/20 text-gray-400">
            Borrador
          </Badge>
        )
      case "processed":
        return (
          <Badge variant="secondary" className="bg-blue-500/20 text-blue-400">
            Procesado
          </Badge>
        )
      case "paid":
        return (
          <Badge variant="secondary" className="bg-green-500/20 text-green-400">
            Pagado
          </Badge>
        )
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  // Calculate total earnings this year
  const currentYear = new Date().getFullYear()
  const thisYearRecords =
    payrollRecords?.filter((record) => new Date(record.pay_period_start).getFullYear() === currentYear) || []
  const totalEarnings = thisYearRecords.reduce((sum, record) => sum + Number(record.net_salary), 0)

  return (
    <EmployeeLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold cyber-text">Mis Recibos de Sueldo</h1>
          <p className="text-muted-foreground">Consulta tu historial de pagos y descarga recibos</p>
        </div>

        {/* Summary Card */}
        <Card className="cyber-border border-primary/20 cyber-glow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Resumen {currentYear}
            </CardTitle>
            <CardDescription>Ingresos acumulados este año</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-primary cyber-text">${totalEarnings.toLocaleString()}</p>
                <p className="text-sm text-muted-foreground">Total Neto</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold cyber-text">{thisYearRecords.length}</p>
                <p className="text-sm text-muted-foreground">Recibos</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold cyber-text">
                  ${thisYearRecords.length > 0 ? (totalEarnings / thisYearRecords.length).toLocaleString() : "0"}
                </p>
                <p className="text-sm text-muted-foreground">Promedio Mensual</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Payroll Records */}
        <div className="grid gap-4">
          {payrollRecords?.map((record) => (
            <Card
              key={record.id}
              className="cyber-border border-primary/20 hover:cyber-glow transition-all duration-300"
            >
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 rounded-full bg-primary/20">
                      <DollarSign className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">
                        Período: {new Date(record.pay_period_start).toLocaleDateString()} -{" "}
                        {new Date(record.pay_period_end).toLocaleDateString()}
                      </CardTitle>
                      <CardDescription>Generado el {new Date(record.created_at).toLocaleDateString()}</CardDescription>
                    </div>
                  </div>
                  {getStatusBadge(record.status)}
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Salario Bruto</p>
                    <p className="font-medium text-green-400">${record.gross_salary.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Deducciones</p>
                    <p className="font-medium text-red-400">-${record.deductions.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Salario Neto</p>
                    <p className="font-medium text-primary cyber-text text-lg">${record.net_salary.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Estado</p>
                    <p className="font-medium">
                      {record.status === "paid" ? "Pagado" : record.status === "processed" ? "Procesado" : "Borrador"}
                    </p>
                  </div>
                </div>

                {(record.bonus > 0 || record.overtime_hours > 0) && (
                  <div className="grid grid-cols-2 gap-4 mb-4 p-3 bg-secondary/20 rounded">
                    {record.bonus > 0 && (
                      <div>
                        <p className="text-sm text-muted-foreground">Bonificación</p>
                        <p className="font-medium text-green-400">+${record.bonus.toLocaleString()}</p>
                      </div>
                    )}
                    {record.overtime_hours > 0 && (
                      <div>
                        <p className="text-sm text-muted-foreground">Horas Extra</p>
                        <p className="font-medium">
                          {record.overtime_hours}h (+${record.overtime_pay.toLocaleString()})
                        </p>
                      </div>
                    )}
                  </div>
                )}

                <div className="flex gap-2">
                  <Button size="sm" variant="outline" className="cyber-border bg-transparent">
                    <Eye className="mr-2 h-4 w-4" />
                    Ver Detalles
                  </Button>
                  {record.pdf_url && (
                    <Button size="sm" className="cyber-glow">
                      <Download className="mr-2 h-4 w-4" />
                      Descargar PDF
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {(!payrollRecords || payrollRecords.length === 0) && (
          <Card className="cyber-border border-primary/20">
            <CardContent className="text-center py-12">
              <DollarSign className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No tienes recibos de sueldo</h3>
              <p className="text-muted-foreground">Los recibos de sueldo aparecerán aquí cuando sean procesados.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </EmployeeLayout>
  )
}