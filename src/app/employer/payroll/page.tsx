import { createClient } from "@/lib/supabase/server"
import { EmployerLayout } from "@/components/layout/employer-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { PayrollActions } from "@/components/forms/payroll-actions"
import { Plus, DollarSign, Calendar, TrendingUp } from "lucide-react"
import Link from "next/link"

export default async function PayrollPage() {
  const supabase = await createClient()

  const { data: payrollRecords } = await supabase
    .from("payroll_records")
    .select(
      `
      *,
      employees!inner(
        employee_id,
        users!inner(full_name, email)
      )
    `,
    )
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

  // Calculate summary statistics
  const currentMonth = new Date().getMonth()
  const currentYear = new Date().getFullYear()
  const thisMonthRecords = payrollRecords?.filter((record) => {
    const recordDate = new Date(record.pay_period_start)
    return recordDate.getMonth() === currentMonth && recordDate.getFullYear() === currentYear
  })

  const totalThisMonth = thisMonthRecords?.reduce((sum, record) => sum + Number(record.net_salary), 0) || 0
  const processedCount = payrollRecords?.filter((record) => record.status === "processed").length || 0
  const paidCount = payrollRecords?.filter((record) => record.status === "paid").length || 0

  return (
    <EmployerLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold cyber-text">Gestión de Nómina</h1>
            <p className="text-muted-foreground">Administra los recibos de sueldo de tus empleados</p>
          </div>
          <Button asChild className="cyber-glow">
            <Link href="/employer/payroll/new">
              <Plus className="mr-2 h-4 w-4" />
              Nuevo Recibo
            </Link>
          </Button>
        </div>

        {/* Summary Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="cyber-border border-primary/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Este Mes</CardTitle>
              <DollarSign className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold cyber-text">${totalThisMonth.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">{thisMonthRecords?.length || 0} recibos</p>
            </CardContent>
          </Card>

          <Card className="cyber-border border-primary/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Procesados</CardTitle>
              <TrendingUp className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold cyber-text">{processedCount}</div>
              <p className="text-xs text-muted-foreground">Listos para pago</p>
            </CardContent>
          </Card>

          <Card className="cyber-border border-primary/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pagados</CardTitle>
              <Calendar className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold cyber-text">{paidCount}</div>
              <p className="text-xs text-muted-foreground">Completados</p>
            </CardContent>
          </Card>
        </div>

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
                      <CardTitle className="text-lg">{record.employees.users.full_name}</CardTitle>
                      <CardDescription>ID: {record.employees.employee_id}</CardDescription>
                    </div>
                  </div>
                  {getStatusBadge(record.status)}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Período</p>
                    <p className="font-medium">
                      {new Date(record.pay_period_start).toLocaleDateString()} -{" "}
                      {new Date(record.pay_period_end).toLocaleDateString()}
                    </p>
                  </div>
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
                    <p className="font-medium text-primary cyber-text">${record.net_salary.toLocaleString()}</p>
                  </div>
                </div>

                {(record.bonus > 0 || record.overtime_hours > 0) && (
                  <div className="grid grid-cols-2 gap-4 p-3 bg-secondary/20 rounded">
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

                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <div className="flex items-center">
                    <Calendar className="mr-2 h-4 w-4" />
                    Creado el {new Date(record.created_at).toLocaleString()}
                  </div>
                </div>

                <PayrollActions payrollId={record.id} status={record.status} pdfUrl={record.pdf_url} />
              </CardContent>
            </Card>
          ))}
        </div>

        {(!payrollRecords || payrollRecords.length === 0) && (
          <Card className="cyber-border border-primary/20">
            <CardContent className="text-center py-12">
              <DollarSign className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No hay registros de nómina</h3>
              <p className="text-muted-foreground mb-4">Comienza creando el primer recibo de sueldo.</p>
              <Button asChild className="cyber-glow">
                <Link href="/employer/payroll/new">
                  <Plus className="mr-2 h-4 w-4" />
                  Crear Primer Recibo
                </Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </EmployerLayout>
  )
}
