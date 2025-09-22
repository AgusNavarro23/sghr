"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function approveLeaveRequest(leaveRequestId: string, approverId: string) {
  const supabase = await createClient()

  try {
    const { error } = await supabase
      .from("leave_requests")
      .update({
        status: "approved",
        approved_by: approverId,
        approved_at: new Date().toISOString(),
      })
      .eq("id", leaveRequestId)

    if (error) {
      return { success: false, error: error.message }
    }

    // Create notification for employee
    const { data: leaveRequest } = await supabase
      .from("leave_requests")
      .select(`
        *,
        employees!inner(user_id),
        leave_types(name)
      `)
      .eq("id", leaveRequestId)
      .single()

    if (leaveRequest) {
      await supabase.from("notifications").insert({
        user_id: leaveRequest.employees.user_id,
        title: "Licencia Aprobada",
        message: `Tu solicitud de ${leaveRequest.leave_types.name} ha sido aprobada.`,
        type: "leave_request",
      })
    }

    revalidatePath("/employer/leaves")
    return { success: true }
  } catch (error) {
    return { success: false, error: "Error inesperado" }
  }
}

export async function rejectLeaveRequest(leaveRequestId: string, approverId: string, rejectionReason: string) {
  const supabase = await createClient()

  try {
    const { error } = await supabase
      .from("leave_requests")
      .update({
        status: "rejected",
        approved_by: approverId,
        approved_at: new Date().toISOString(),
        rejection_reason: rejectionReason,
      })
      .eq("id", leaveRequestId)

    if (error) {
      return { success: false, error: error.message }
    }

    // Create notification for employee
    const { data: leaveRequest } = await supabase
      .from("leave_requests")
      .select(`
        *,
        employees!inner(user_id),
        leave_types(name)
      `)
      .eq("id", leaveRequestId)
      .single()

    if (leaveRequest) {
      await supabase.from("notifications").insert({
        user_id: leaveRequest.employees.user_id,
        title: "Licencia Rechazada",
        message: `Tu solicitud de ${leaveRequest.leave_types.name} ha sido rechazada. Motivo: ${rejectionReason}`,
        type: "leave_request",
      })
    }

    revalidatePath("/employer/leaves")
    return { success: true }
  } catch (error) {
    return { success: false, error: "Error inesperado" }
  }
}

export async function cancelLeaveRequest(leaveRequestId: string, employeeId: string) {
  const supabase = await createClient()

  try {
    // Verify the leave request belongs to the employee and is pending
    const { data: leaveRequest } = await supabase
      .from("leave_requests")
      .select("*")
      .eq("id", leaveRequestId)
      .eq("employee_id", employeeId)
      .eq("status", "pending")
      .single()

    if (!leaveRequest) {
      return { success: false, error: "Solicitud no encontrada o no se puede cancelar" }
    }

    const { error } = await supabase
      .from("leave_requests")
      .update({
        status: "cancelled",
      })
      .eq("id", leaveRequestId)

    if (error) {
      return { success: false, error: error.message }
    }

    revalidatePath("/employee/leaves")
    return { success: true }
  } catch (error) {
    return { success: false, error: "Error inesperado" }
  }
}
