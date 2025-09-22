import { createClient } from "@/lib/supabase/server"
import { EmployeeLayout } from "@/components/layout/employee-layout"
import { LeaveRequestForm } from "@/components/forms/leave-request-form"
import { redirect } from "next/navigation"

export default async function NewLeaveRequestPage() {
  const supabase = await createClient()

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/auth/login")

  // Get employee data
  const { data: employee } = await supabase.from("employees").select("*").eq("user_id", user.id).single()

  if (!employee) redirect("/employee/dashboard")

  // Get leave types
  const { data: leaveTypes } = await supabase.from("leave_types").select("*").order("name")

  return (
    <EmployeeLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold cyber-text">Nueva Solicitud de Licencia</h1>
          <p className="text-muted-foreground">Solicita tiempo libre completando el siguiente formulario</p>
        </div>

        <LeaveRequestForm leaveTypes={leaveTypes || []} employeeId={employee.id} />
      </div>
    </EmployeeLayout>
  )
}
