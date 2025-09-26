// app/api/auth/update-password/route.ts
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { z } from "zod";
import { createSupabaseServer } from "@/lib/supabase/superserver";

const BodySchema = z.object({
  code: z.string().min(1),
  password: z
    .string()
    .min(8)
    .refine((v) => /[A-Z]/.test(v), "Debe incluir al menos una mayúscula")
    .refine((v) => /[a-z]/.test(v), "Debe incluir al menos una minúscula"),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { code, password } = BodySchema.parse(body);

    const supabase = await createSupabaseServer();

    const { data: sessionData, error: exchangeError } =
      await supabase.auth.exchangeCodeForSession(code);
    if (exchangeError) {
      return NextResponse.json({ ok: false, message: exchangeError.message }, { status: 400 });
    }
    if (!sessionData?.user) {
      return NextResponse.json({ ok: false, message: "No se pudo autenticar la sesión." }, { status: 401 });
    }

    const { error: updateError } = await supabase.auth.updateUser({ password });
    if (updateError) {
      return NextResponse.json({ ok: false, message: updateError.message }, { status: 400 });
    }

    return NextResponse.json({ ok: true, message: "Contraseña actualizada." });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Error al rechazar la solicitud"
    // IMPORTANTE: siempre JSON, nunca HTML
    return NextResponse.json({ ok: false, msg }, { status: 500 });
  }
}
