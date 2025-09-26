import { createClient } from "@/lib/supabase/server";
import { EmployerLayout } from "@/components/layout/employer-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, DollarSign, Calendar, Users as UsersIcon } from "lucide-react";
import Link from "next/link";

function nombreMesEs(m: number) {
  const d = new Date(2000, m - 1, 1);
  return new Intl.DateTimeFormat("es-AR", { month: "long" }).format(d);
}

interface PayslipData {
  id: string;
  year: number;
  month: number;
  pdf_url: string | null;
  state: string;
  created_at: string;
  employee: {
    employee_id: string;
    user: {
      full_name: string;
      email: string;
    };
  };
}

export default async function PayrollPage() {
  const supabase = await createClient();

  const { data: rawPayslips } = await supabase
    .from("payslips")
    .select(`
      id,
      year,
      month,
      pdf_url,
      state,
      created_at,
      employees!inner(
        employee_id,
        users!inner(full_name, email)
      )
    `)
    .order("created_at", { ascending: false });

  // Transformar los datos para acceso más fácil
  const payslips: PayslipData[] = rawPayslips?.map(p => ({
    ...p,
    employee: {
      employee_id: p.employees[0]?.employee_id || '',
      user: {
        full_name: p.employees[0]?.users[0]?.full_name || '',
        email: p.employees[0]?.users[0]?.email || ''
      }
    }
  })) || [];

  const ahora = new Date();
  const currentMonth = ahora.getMonth() + 1;
  const currentYear = ahora.getFullYear();

  const thisMonthPayslips = payslips.filter((p) => p.month === currentMonth && p.year === currentYear);
  const totalThisMonth = thisMonthPayslips.length;
  const totalPayslips = payslips.length;
  const uniqueEmpThisMonth = new Set(
    thisMonthPayslips.map((p) => p.employee?.employee_id)
  ).size;

  return (
    <EmployerLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold cyber-text">Gestión de Recibos</h1>
            <p className="text-muted-foreground">Administra los PDFs de recibos por mes y año</p>
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
              <CardTitle className="text-sm font-medium">Recibos este mes</CardTitle>
              <Calendar className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold cyber-text">{totalThisMonth}</div>
              <p className="text-xs text-muted-foreground">
                {nombreMesEs(currentMonth)} {currentYear}
              </p>
            </CardContent>
          </Card>

          <Card className="cyber-border border-primary/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Empleados con recibo (este mes)</CardTitle>
              <UsersIcon className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold cyber-text">{uniqueEmpThisMonth}</div>
              <p className="text-xs text-muted-foreground">Únicos</p>
            </CardContent>
          </Card>

          <Card className="cyber-border border-primary/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de recibos</CardTitle>
              <DollarSign className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold cyber-text">{totalPayslips}</div>
              <p className="text-xs text-muted-foreground">Histórico</p>
            </CardContent>
          </Card>
        </div>

        {/* Payslips */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {payslips.map((p) => (
            <Card
              key={p.id}
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
                        {p.employee?.user?.full_name || 'Sin nombre'}
                      </CardTitle>
                      <CardDescription>
                        ID: {p.employee?.employee_id || 'Sin ID'}
                      </CardDescription>
                    </div>
                  </div>
                  {p.state === "Firmada" ? (
                    <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-400/30">
                      Firmada
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="bg-yellow-500/20 text-yellow-400">
                      No Firmada
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <div className="flex items-center">
                    <Calendar className="mr-2 h-4 w-4" />
                    {nombreMesEs(p.month).toUpperCase()} - {p.year}
                  </div>
                </div>

                <div className="flex gap-2">
                  {p.pdf_url ? (
                    <Button asChild size="sm" className="cyber-glow">
                      <a href={p.pdf_url} target="_blank" rel="noopener noreferrer">
                        Ver / Descargar PDF
                      </a>
                    </Button>
                  ) : (
                    <Button size="sm" variant="outline" disabled className="cyber-border bg-transparent">
                      Sin PDF
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {payslips.length === 0 && (
          <Card className="cyber-border border-primary/20">
            <CardContent className="text-center py-12">
              <DollarSign className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No hay recibos cargados</h3>
              <p className="text-muted-foreground mb-4">
                Comenzá subiendo el primer PDF de recibo.
              </p>
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
  );
}