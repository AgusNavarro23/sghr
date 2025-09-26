"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Check, Loader2 } from "lucide-react";

export function FirmarButton({ payslipId }: { payslipId: string }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleFirmar = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/payslips/firmar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ payslip_id: payslipId }),
      });

      const ct = res.headers.get("content-type") || "";
      const data = ct.includes("application/json") ? await res.json() : { ok: false, message: "Respuesta no JSON" };

      if (!res.ok || !data.ok) throw new Error(data?.message || "No se pudo firmar");

      // refresca la lista en el server component
      router.refresh();
    } catch (e) {
      console.error(e);
      alert((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button size="sm" onClick={handleFirmar} disabled={loading} className="cyber-glow">
      {loading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Firmando...
        </>
      ) : (
        <>
          <Check className="mr-2 h-4 w-4" />
          Firmar
        </>
      )}
    </Button>
  );
}
