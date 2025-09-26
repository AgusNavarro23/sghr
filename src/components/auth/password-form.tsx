"use client";

import type React from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"; // ajusta si tu ruta es distinta
import { Shield, Loader2 } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { createClient } from "@/lib/supabase/client";

export default function PasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [okMsg, setOkMsg] = useState("");
  const router = useRouter();
  const supabase = createClient();

  const handleSendReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setOkMsg("");

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        // Ajusta la URL a la ruta donde el usuario cambiará su password
        redirectTo: `${window.location.origin}/auth/update-password`,
      });

      if (error) {
        setError(error.message);
      } else {
        setOkMsg(
          "Si el correo existe, te enviamos un link de recuperación. Revisa tu bandeja de entrada y spam."
        );
      }
    } catch {
      setError("Error inesperado al enviar el link de recuperación");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="cyber-glow border-primary/20">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <Shield className="h-12 w-12 text-primary cyber-text" />
            </div>
            <CardTitle className="text-2xl font-bold cyber-text">CyberHR</CardTitle>
            <CardDescription className="text-muted-foreground">
              Recupera tu contraseña
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSendReset} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="tu@empresa.com"
                  required
                  className="cyber-border"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

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

              <Button type="submit" className="w-full cyber-glow" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Enviando Link de Recuperación...
                  </>
                ) : (
                  "Enviar Link de Recuperación"
                )}
              </Button>

              {/* Opcional: volver al login */}
              <Button
                type="button"
                variant="ghost"
                className="w-full mt-2"
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
