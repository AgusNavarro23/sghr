"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, UserPlus } from "lucide-react"

export function RegisterForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [fullName, setFullName] = useState("")
  const [role, setRole] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL || window.location.origin,
          data: {
            full_name: fullName,
            role: role,
          },
        },
      })

      if (error) {
        setError(error.message)
        return
      }

      if (data.user) {
        // Insert user data into our users table
        const { error: insertError } = await supabase.from("users").insert({
          id: data.user.id,
          email: data.user.email!,
          full_name: fullName,
          role: role,
        })

        if (insertError) {
          setError("Error al crear el perfil de usuario")
          return
        }

        setSuccess(true)
      }
    } catch (err) {
      setError("Error inesperado al registrarse")
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md cyber-glow border-primary/20">
          <CardContent className="pt-6 text-center">
            <UserPlus className="h-12 w-12 text-primary mx-auto mb-4 cyber-text" />
            <h2 className="text-xl font-bold mb-2">¡Registro Exitoso!</h2>
            <p className="text-muted-foreground mb-4">Revisa tu email para confirmar tu cuenta.</p>
            <Button onClick={() => router.push("/auth/login")} className="cyber-glow">
              Ir al Login
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="cyber-glow border-primary/20">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <UserPlus className="h-12 w-12 text-primary cyber-text" />
            </div>
            <CardTitle className="text-2xl font-bold cyber-text">Registro</CardTitle>
            <CardDescription className="text-muted-foreground">Crea tu cuenta en CyberHR</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleRegister} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">Nombre Completo</Label>
                <Input
                  id="fullName"
                  type="text"
                  placeholder="Juan Pérez"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  className="cyber-border"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="tu@empresa.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="cyber-border"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Contraseña</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="cyber-border"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">Rol</Label>
                <Select value={role} onValueChange={setRole} required>
                  <SelectTrigger className="cyber-border">
                    <SelectValue placeholder="Selecciona tu rol" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="employee">Empleado</SelectItem>
                    <SelectItem value="employer">Empleador</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              <Button type="submit" className="w-full cyber-glow" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Registrando...
                  </>
                ) : (
                  "Registrarse"
                )}
              </Button>
            </form>
            <div className="mt-4 text-center">
              <Button variant="link" onClick={() => router.push("/auth/login")} className="text-primary">
                ¿Ya tienes cuenta? Inicia sesión
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
