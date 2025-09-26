'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Upload, User2, CalendarDays } from "lucide-react";
import { crearReciboAction } from "@/app/employer/payroll/new/recibo-actions";

type Employee = {
  id: string;
  employee_id: string;
  users: {
    full_name: string;
    email: string;
  };
};

export function PayrollForm({ employees }: { employees: Employee[] }) {
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1; // 1-12

  return (
    <Card className="cyber-border border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5 text-primary" />
          Nuevo Recibo de Sueldo
        </CardTitle>
        <CardDescription>
          Subí un PDF y asignalo al empleado y período (mes/año)
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Importante: action apunta a la Server Action; sin onSubmit en cliente */}
        <form action={crearReciboAction} encType="multipart/form-data" className="space-y-6 max-w-xl">
          {/* Empleado */}
          <div className="space-y-2">
            <Label htmlFor="employee_id" className="flex items-center gap-2">
              <User2 className="h-4 w-4 text-primary" />
              Empleado *
            </Label>
            <select
              id="employee_id"
              name="employee_id"
              required
              className="cyber-border bg-transparent w-full h-10 rounded-md px-3 text-sm"
              defaultValue=""
            >
              <option value="" disabled>
                Seleccioná un empleado
              </option>
              {employees.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.users.full_name} — {e.employee_id}
                </option>
              ))}
            </select>
          </div>

          {/* Período (Mes / Año) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="month" className="flex items-center gap-2">
                <CalendarDays className="h-4 w-4 text-primary" />
                Mes *
              </Label>
              <select
                id="month"
                name="month"
                required
                className="cyber-border bg-transparent w-full h-10 rounded-md px-3 text-sm"
                defaultValue={String(currentMonth)}
              >
                {[
                  [1, "Enero"], [2, "Febrero"], [3, "Marzo"], [4, "Abril"], [5, "Mayo"], [6, "Junio"],
                  [7, "Julio"], [8, "Agosto"], [9, "Septiembre"], [10, "Octubre"], [11, "Noviembre"], [12, "Diciembre"],
                ].map(([v, label]) => (
                  <option key={v} value={String(v)}>
                    {label}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="year">Año *</Label>
              <Input
                id="year"
                name="year"
                type="number"
                min={1990}
                max={2100}
                defaultValue={currentYear}
                required
                className="cyber-border"
              />
            </div>
          </div>

          {/* PDF */}
          <div className="space-y-2">
            <Label htmlFor="pdf">PDF del recibo *</Label>
            <Input id="pdf" name="pdf" type="file" accept="application/pdf" required className="cyber-border" />
            <p className="text-xs text-muted-foreground">Máximo 10MB. Solo formato PDF.</p>
          </div>

          <div className="flex gap-4">
            <Button type="submit" className="flex-1 cyber-glow">
              Guardar Recibo
            </Button>
            <Button type="button" variant="outline" className="cyber-border bg-transparent" onClick={() => history.back()}>
              Cancelar
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
