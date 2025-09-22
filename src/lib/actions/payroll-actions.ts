"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function processPayrollRecord(payrollId: string) {
  const supabase = await createClient()

  try {
    const { error } = await supabase
      .from("payroll_records")
      .update({
        status: "processed",
      })
      .eq("id", payrollId)

    if (error) {
      return { success: false, error: error.message }
    }

    // Create notification for employee
    const { data: payrollRecord } = await supabase
      .from("payroll_records")
      .select(`
        *,
        employees!inner(user_id)
      `)
      .eq("id", payrollId)
      .single()

    if (payrollRecord) {
      await supabase.from("notifications").insert({
        user_id: payrollRecord.employees.user_id,
        title: "Recibo de Sueldo Procesado",
        message: `Tu recibo de sueldo del período ${new Date(payrollRecord.pay_period_start).toLocaleDateString()} - ${new Date(payrollRecord.pay_period_end).toLocaleDateString()} ha sido procesado.`,
        type: "payroll",
      })
    }

    revalidatePath("/employer/payroll")
    return { success: true }
  } catch (error) {
    return { success: false, error: "Error inesperado" }
  }
}

export async function markPayrollAsPaid(payrollId: string) {
  const supabase = await createClient()

  try {
    const { error } = await supabase
      .from("payroll_records")
      .update({
        status: "paid",
      })
      .eq("id", payrollId)

    if (error) {
      return { success: false, error: error.message }
    }

    // Create notification for employee
    const { data: payrollRecord } = await supabase
      .from("payroll_records")
      .select(`
        *,
        employees!inner(user_id)
      `)
      .eq("id", payrollId)
      .single()

    if (payrollRecord) {
      await supabase.from("notifications").insert({
        user_id: payrollRecord.employees.user_id,
        title: "Sueldo Pagado",
        message: `Tu sueldo del período ${new Date(payrollRecord.pay_period_start).toLocaleDateString()} - ${new Date(payrollRecord.pay_period_end).toLocaleDateString()} ha sido pagado.`,
        type: "payroll",
      })
    }

    revalidatePath("/employer/payroll")
    return { success: true }
  } catch (error) {
    return { success: false, error: "Error inesperado" }
  }
}

export async function deletePayrollRecord(payrollId: string) {
  const supabase = await createClient()

  try {
    // Only allow deletion of draft records
    const { data: payrollRecord } = await supabase.from("payroll_records").select("status").eq("id", payrollId).single()

    if (!payrollRecord || payrollRecord.status !== "draft") {
      return { success: false, error: "Solo se pueden eliminar recibos en borrador" }
    }

    const { error } = await supabase.from("payroll_records").delete().eq("id", payrollId)

    if (error) {
      return { success: false, error: error.message }
    }

    revalidatePath("/employer/payroll")
    return { success: true }
  } catch (error) {
    return { success: false, error: "Error inesperado" }
  }
}

export async function generatePayrollPDF(payrollId: string) {
  // This would integrate with a PDF generation service
  // For now, we'll just simulate the process
  const supabase = await createClient()

  try {
    // In a real implementation, you would:
    // 1. Get the payroll record data
    // 2. Generate a PDF using a library like jsPDF or Puppeteer
    // 3. Upload the PDF to storage (Vercel Blob, S3, etc.)
    // 4. Update the record with the PDF URL

    const pdfUrl = `/api/payroll/${payrollId}/pdf` // Simulated URL

    const { error } = await supabase.from("payroll_records").update({ pdf_url: pdfUrl }).eq("id", payrollId)

    if (error) {
      return { success: false, error: error.message }
    }

    revalidatePath("/employer/payroll")
    return { success: true, pdfUrl }
  } catch (error) {
    return { success: false, error: "Error inesperado" }
  }
}
