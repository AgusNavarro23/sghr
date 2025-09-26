
import { createClient } from "@/lib/supabase/server";
import { EmployerLayout } from "@/components/layout/employer-layout";
import { redirect } from "next/navigation";
import { PayrollForm } from "@/components/forms/payroll-form";

export default async function NewPayrollPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const { data: employees } = await supabase
    .from("employees")
    .select(`
      id,
      employee_id,
      users!inner(
        full_name,
        email
      )
    `)
    .order("employee_id", { ascending: true });

     // Transformar los datos para que coincidan con el tipo Employee
  const transformedEmployees = employees?.map(emp => ({
    ...emp,
    users: emp.users[0] // Tomar el primer (y único) usuario
  })) || [];
  return (
    <EmployerLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold cyber-text">Nuevo Recibo de Sueldo</h1>
          <p className="text-muted-foreground">Subí un PDF y asignalo al empleado y período</p>
        </div>

        <PayrollForm employees={transformedEmployees} />
      </div>
    </EmployerLayout>
  );
}
