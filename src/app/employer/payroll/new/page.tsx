import { createClient } from "@/lib/supabase/server"
import { EmployerLayout } from "@/components/layout/employer-layout"
import { PayrollForm } from "@/components/forms/payroll-form"
import { redirect } from "next/navigation"

export default async function NewPayrollPage() {
  const supabase = await createClient()

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/auth/login")

  // Get active employees
  const { data: employees } = await supabase
    .from("employees")
    .select(`
      id,
      employee_id,
      salary,
      users!inner(
        full_name,
        email
      )
    `)
    .eq("status", "active")
    .order("users(full_name)")

  return (
    <EmployerLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold cyber-text">Nuevo Recibo de Sueldo</h1>
          <p className="text-muted-foreground">Genera un recibo de sueldo para un empleado</p>
        </div>

        <PayrollForm employees={employees || []} />
      </div>
    </EmployerLayout>
  )
}