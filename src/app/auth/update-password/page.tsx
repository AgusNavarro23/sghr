"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";

export default function UpdatePasswordPage() {
  const router = useRouter();
  const [code, setCode] = useState("");       // se setea en useEffect
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [okMsg, setOkMsg] = useState("");
  const [error, setError] = useState("");

  // Leer el code del query string SOLO en el cliente (evita prerender error)
  useEffect(() => {
    try {
      const sp = new URLSearchParams(window.location.search);
      const c = sp.get("code") ?? "";
      setCode(c);
    } catch {
      // no-op
    }
  }, []);

  const requisitos = useMemo(
    () => ({
      length: password.length >= 8,
      mayuscula: /[A-Z]/.test(password),
      minuscula: /[a-z]/.test(password),
    }),
    [password]
  );

  const cumpleTodos = requisitos.length && requisitos.mayuscula && requisitos.minuscula;
  const coincide = password === confirm;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setOkMsg("");

    if (!code) {
      setError("Falta el código del enlace de recuperación.");
      return;
    }
    if (!cumpleTodos) {
      setError("La contraseña no cumple con los requisitos mínimos.");
      return;
    }
    if (!coincide) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/update-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, password }),
      });

      const ct = res.headers.get("content-type") || "";
      if (!ct.includes("application/json")) {
        const text = await res.text();
        throw new Error(`Respuesta no JSON (${res.status}): ${text.slice(0, 200)}...`);
      }

      const json: { ok?: boolean; message?: string } = await res.json();
      if (!res.ok || !json?.ok) {
        throw new Error(json?.message || "No se pudo actualizar la contraseña");
      }

      setOkMsg("Tu contraseña fue actualizada correctamente.");
      setPassword("");
      setConfirm("");
      router.push("/auth/login");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error inesperado al actualizar la contraseña.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="cyber-glow border-primary/20">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold cyber-text">Nueva contraseña</CardTitle>
            <CardDescription className="text-muted-foreground">
              Ingresa y confirma tu nueva contraseña
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input type="hidden" value={code} readOnly />

              <div>
                <Label htmlFor="password">Nueva contraseña</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="cyber-border mt-1"
                />
              </div>

              <div>
                <Label htmlFor="confirm">Confirmar contraseña</Label>
                <Input
                  id="confirm"
                  type="password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  required
                  className="cyber-border mt-1"
                />
              </div>

              <div className="space-y-1 text-sm">
                <p className="font-medium">Requisitos:</p>
                <Validacion ok={requisitos.length} texto="Mínimo 8 caracteres" />
                <Validacion ok={requisitos.mayuscula} texto="Al menos una mayúscula" />
                <Validacion ok={requisitos.minuscula} texto="Al menos una minúscula" />
              </div>

              {!coincide && confirm.length > 0 && (
                <Alert variant="destructive">
                  <AlertDescription>Las contraseñas no coinciden.</AlertDescription>
                </Alert>
              )}

              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              {okMsg && (
                <Alert>
                  <AlertDescription>{okMsg}</AlertDescription>
                </Alert>
              )}

              <Button type="submit" className="w-full cyber-glow" disabled={loading || !cumpleTodos || !coincide}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Actualizando...
                  </>
                ) : (
                  "Guardar nueva contraseña"
                )}
              </Button>

              <Button
                type="button"
                variant="ghost"
                className="w-full"
                onClick={() => router.push("/auth/login")}
              >
                Volver al inicio de sesión
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function Validacion({ ok, texto }: { ok: boolean; texto: string }) {
  return (
    <div className="flex items-center gap-2">
      {ok ? <CheckCircle2 className="h-4 w-4 text-green-500" /> : <XCircle className="h-4 w-4 text-red-500" />}
      <span>{texto}</span>
    </div>
  );
}