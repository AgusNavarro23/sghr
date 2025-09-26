"use server";

import { createClient } from "@/lib/supabase/server";
import { Resend } from "resend";
import { leaveStatusEmailHTML } from "@/lib/email";

const resend = new Resend(process.env.RESEND_API_KEY as string);
const FROM = process.env.MAIL_FROM || "CyberHR <no-reply@example.com>";
const APP_URL = process.env.APP_URL || "http://localhost:3000";

type ActionResult = { success: true } | { success: false; error: string };

async function fetchLeaveDetail(leaveRequestId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("leave_requests")
    .select(`
      id, start_date, end_date, days_requested, reason, status, rejection_reason, approved_at,
      employees!inner(
        users!inner(full_name, email)
      ),
      leave_types(name, description)
    `)
    .eq("id", leaveRequestId)
    .single();

  if (error || !data) throw new Error(error?.message || "No se encontró la solicitud");
  return data as any;
}

export async function approveLeaveRequest(leaveRequestId: string, approverId: string): Promise<ActionResult> {
  try {
    const supabase = await createClient();

    // 1) Actualizar estado
    const { error: updErr } = await supabase
      .from("leave_requests")
      .update({
        status: "approved",
        approved_at: new Date().toISOString(),
        approved_by: approverId, // si tienes esta columna, si no quítala
      })
      .eq("id", leaveRequestId);

    if (updErr) throw new Error(updErr.message);

    // 2) Obtener datos para el email
    const leave = await fetchLeaveDetail(leaveRequestId);
    const employeeName = leave.employees.users.full_name as string;
    const toEmail = leave.employees.users.email as string;
    const leaveType = leave.leave_types.name as string;

    // 3) Enviar email
    await resend.emails.send({
      from: FROM,
      to: toEmail,
      subject: "Tu solicitud de licencia fue aprobada",
      html: leaveStatusEmailHTML({
        employeeName,
        status: "approved",
        leaveType,
        startDate: leave.start_date,
        endDate: leave.end_date,
        appUrl: APP_URL,
      }),
    });

    return { success: true };
  } catch (e: any) {
    return { success: false, error: e?.message || "Error al aprobar y notificar" };
  }
}

export async function rejectLeaveRequest(
  leaveRequestId: string,
  approverId: string,
  rejectionReason: string
): Promise<ActionResult> {
  try {
    const supabase = await createClient();

    // 1) Actualizar estado y motivo
    const { error: updErr } = await supabase
      .from("leave_requests")
      .update({
        status: "rejected",
        rejection_reason: rejectionReason,
        approved_at: new Date().toISOString(), // o processed_at si tienes
        approved_by: approverId,               // opcional si existe
      })
      .eq("id", leaveRequestId);

    if (updErr) throw new Error(updErr.message);

    // 2) Obtener datos para el email
    const leave = await fetchLeaveDetail(leaveRequestId);
    const employeeName = leave.employees.users.full_name as string;
    const toEmail = leave.employees.users.email as string;
    const leaveType = leave.leave_types.name as string;

    // 3) Enviar email
    await resend.emails.send({
      from: FROM,
      to: toEmail,
      subject: "Tu solicitud de licencia fue rechazada",
      html: leaveStatusEmailHTML({
        employeeName,
        status: "rejected",
        leaveType,
        startDate: leave.start_date,
        endDate: leave.end_date,
        rejectionReason,
        appUrl: APP_URL,
      }),
    });

    return { success: true };
  } catch (e: any) {
    return { success: false, error: e?.message || "Error al rechazar y notificar" };
  }
}
