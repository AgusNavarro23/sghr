export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { z } from "zod";
import { createSupabaseServer } from "@/lib/supabase/superserver";

const Body = z.object({
  payslip_id: z.string().min(1),
});

export async function POST(req: Request) {
  try {
    const { payslip_id } = Body.parse(await req.json());
    const supabase = await createSupabaseServer();

    // Aseguramos que hay usuario
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ ok: false, message: "No autenticado" }, { status: 401 });
    }

    // Update: estado → Firmada (RLS asegura que sea del empleado)
    const { error } = await supabase
      .from("payslips")
      .update({ state: "Firmada" })
      .eq("id", payslip_id);

    if (error) {
      return NextResponse.json({ ok: false, message: error.message }, { status: 400 });
    }

    return NextResponse.json({ ok: true, message: "Recibo firmado" });
  } catch (err: unknown) {
    const message = err instanceof Error? err.message:"Error al firmar el Recibo."
    return NextResponse.json({ ok: false, message }, { status: 500 });
  }
}
