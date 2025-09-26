"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export async function crearReciboAction(formData: FormData) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  // Autorización: employer/admin
  const { data: rol, error: rolError } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single();

  if (rolError || !rol || !["employer", "admin"].includes(rol.role)) {
    throw new Error("No autorizado para realizar esta acción");
  }

  const employee_id = formData.get("employee_id") as string;
  const year = Number(formData.get("year"));
  const month = Number(formData.get("month"));
  const pdf = formData.get("pdf") as File | null;

  // Validaciones mínimas
  if (!employee_id || !year || !month || !pdf || pdf.size === 0) {
    throw new Error("Datos incompletos o PDF faltante");
  }
  if (year < 1990 || year > 2100) throw new Error("Año inválido");
  if (month < 1 || month > 12) throw new Error("Mes inválido");
  if (pdf.type !== "application/pdf") throw new Error("El archivo debe ser un PDF");
  if (pdf.size > 10 * 1024 * 1024) throw new Error("El archivo es muy grande (máximo 10MB)");

  // Verificar empleado - sin !inner para evitar array
  const { data: employee, error: empError } = await supabase
    .from("employees")
    .select(`
      id,
      employee_id,
      users(full_name)
    `)
    .eq("id", employee_id)
    .single();

  if (empError || !employee) {
    throw new Error("Empleado no encontrado");
  }

  try {
    const monthPadded = String(month).padStart(2, "0");
    const filePath = `${employee_id}/${year}-${monthPadded}.pdf`;

    // Subir PDF al bucket privado 'payslips'
    const { error: upErr } = await supabase.storage
      .from("payslips")
      .upload(filePath, pdf, {
        upsert: true,
        contentType: "application/pdf",
      });
    if (upErr) throw new Error(`No se pudo subir el PDF: ${upErr.message}`);

    // Generar Signed URL (1 año)
    const { data: signedUrlData, error: urlError } = await supabase.storage
      .from("payslips")
      .createSignedUrl(filePath, 365 * 24 * 60 * 60);
    if (urlError || !signedUrlData?.signedUrl) {
      throw new Error("No se pudo generar el enlace firmado del PDF");
    }
    const pdfUrl: string = signedUrlData.signedUrl;

    // Upsert en public.payslips (único por employee_id/year/month)
    const { data: existente, error: findError } = await supabase
      .from("payslips")
      .select("id")
      .eq("employee_id", employee_id)
      .eq("year", year)
      .eq("month", month)
      .maybeSingle();
    if (findError) throw new Error("Error al verificar registros existentes");

    if (existente?.id) {
      const { error: updateError } = await supabase
        .from("payslips")
        .update({ pdf_url: pdfUrl })
        .eq("id", existente.id);
      if (updateError) throw new Error("No se pudo actualizar el registro de recibo");
    } else {
      const { error: insertError } = await supabase
        .from("payslips")
        .insert({ employee_id, year, month, pdf_url: pdfUrl });
      if (insertError) throw new Error("No se pudo crear el registro de recibo");
    }

    // Acceder al primer elemento del array users
    const nombreEmpleado = employee.users?.[0]?.full_name ?? "";
    redirect(
      `/employer/payroll?creado=1&empleado=${encodeURIComponent(
        nombreEmpleado
      )}&periodo=${monthPadded}-${year}`
    );
  } catch (error) {
    if (error instanceof Error && error.message === "NEXT_REDIRECT") throw error;
    throw new Error(error instanceof Error ? error.message : "Error inesperado al procesar el recibo");
  }
}