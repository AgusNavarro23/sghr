import { createClient } from "@/lib/supabase/server";
import { EmployeeLayout } from "@/components/layout/employee-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DollarSign, Download, Calendar, TrendingUp } from "lucide-react";
import { FirmarButton } from "@/components/ui/FirmarButton";

function nombreMesEs(m: number) {
  const d = new Date(2000, m - 1, 1);
  return new Intl.DateTimeFormat("es-AR", { month: "long" }).format(d).toUpperCase();
}

export default async function EmployeePayrollPage() {
  const supabase = await createClient();

  // Usuario actual
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  // Empleado vinculado
  const { data: employee } = await supabase
    .from("employees")
    .select("id")
    .eq("user_id", user.id)
    .single();

  if (!employee) return null;

  // Mis payslips
  const { data: payslips } = await supabase
    .from("payslips")
    .select("id, year, month, pdf_url, created_at,state")
    .eq("employee_id", employee.id)
    .order("year", { ascending: false })
    .order("month", { ascending: false });

  const currentYear = new Date().getFullYear();
  const thisYearCount = payslips?.filter((p) => p.year === currentYear).length ?? 0;

  return (
    <EmployeeLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold cyber-text">Mis Recibos</h1>
          <p className="text-muted-foreground">Descargá tus PDFs por mes y año</p>
        </div>

        {/* Resumen simple */}
        <Card className="cyber-border border-primary/20 cyber-glow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Resumen {currentYear}
            </CardTitle>
            <CardDescription>Recibos disponibles este año</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold cyber-text">{thisYearCount}</p>
                <p className="text-sm text-muted-foreground">Recibos {currentYear}</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold cyber-text">{payslips?.length ?? 0}</p>
                <p className="text-sm text-muted-foreground">Total histórico</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold cyber-text">
                  {payslips?.[0] ? `${nombreMesEs(payslips[0].month)} ${payslips[0].year}` : "—"}
                </p>
                <p className="text-sm text-muted-foreground">Último recibo</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Listado */}
        <div className="grid gap-4">
          {payslips?.map((p) => (
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
                        {nombreMesEs(p.month)} {p.year}
                      </CardTitle>
                      <CardDescription>
                        Generado el {new Date(p.created_at).toLocaleDateString()}
                      </CardDescription>
                    </div>
                  </div>
                                    {/* ★ Badge de estado */}
                  {p.state === "Firmada" ? (
                    <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-400/30">
                      Firmada
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="bg-yellow-500/20 text-yellow-400">
                      No Firmada
                    </Badge>
                  )}
                  <Badge variant="secondary" className="bg-blue-500/20 text-blue-400">
                    PDF
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="flex gap-2">
                {p.pdf_url ? (
                  <Button asChild size="sm" className="cyber-glow">
                    <a href={p.pdf_url} target="_blank" rel="noopener noreferrer">
                      <Download className="mr-2 h-4 w-4" />
                      Descargar
                    </a>
                  </Button>
                ) : (
                  <Button size="sm" variant="outline" disabled className="cyber-border bg-transparent">
                    Sin PDF
                  </Button>
                )}
              {/* ★ Botón Firmar si está "No Firmada" */}
                {p.state === "No Firmada" && (
                  <FirmarButton payslipId={p.id} />
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {(!payslips || payslips.length === 0) && (
          <Card className="cyber-border border-primary/20">
            <CardContent className="text-center py-12">
              <DollarSign className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No tenés recibos</h3>
              <p className="text-muted-foreground">
                Cuando tu empleador suba un PDF de recibo, aparecerá aquí.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </EmployeeLayout>
  );
}
