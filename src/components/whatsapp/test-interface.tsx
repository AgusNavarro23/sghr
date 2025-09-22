"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Send, Bot } from "lucide-react"

export function WhatsAppTestInterface() {
  const [message, setMessage] = useState("")
  const [phone, setPhone] = useState("+1234567890")
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)

  const testMessages = [
    "Necesito vacaciones del 20 al 30 de diciembre",
    "Solicito licencia por enfermedad mañana",
    "Quiero tomar tiempo personal la próxima semana",
    "Necesito licencia de maternidad a partir del 15 de enero",
    "Hola, ¿cómo estás?", // Non-leave request
  ]

  const handleSendTest = async () => {
    if (!message.trim()) return

    setLoading(true)
    setResult(null)

    try {
      const response = await fetch("/api/whatsapp/test", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message, phone }),
      })

      const data = await response.json()
      setResult(data)
    } catch (error) {
      setResult({ error: "Error testing message" })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="cyber-border border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bot className="h-5 w-5 text-primary" />
          Interfaz de Prueba del Bot
        </CardTitle>
        <CardDescription>Simula mensajes de WhatsApp para probar el bot de IA</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="phone">Número de Teléfono</Label>
            <Input
              id="phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+1234567890"
              className="cyber-border"
            />
          </div>
          <div className="space-y-2">
            <Label>Mensajes de Ejemplo</Label>
            <div className="flex flex-wrap gap-2">
              {testMessages.map((testMsg, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  onClick={() => setMessage(testMsg)}
                  className="cyber-border bg-transparent text-xs"
                >
                  {testMsg.substring(0, 20)}...
                </Button>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="message">Mensaje</Label>
          <Textarea
            id="message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Escribe un mensaje para probar el bot..."
            className="cyber-border"
            rows={3}
          />
        </div>

        <Button onClick={handleSendTest} disabled={loading || !message.trim()} className="cyber-glow">
          {loading ? (
            "Procesando..."
          ) : (
            <>
              <Send className="mr-2 h-4 w-4" />
              Enviar Mensaje de Prueba
            </>
          )}
        </Button>

        {result && (
          <div className="space-y-4">
            <Alert>
              <AlertDescription>
                {result.error ? `Error: ${result.error}` : "Mensaje procesado exitosamente"}
              </AlertDescription>
            </Alert>

            <details className="space-y-2">
              <summary className="cursor-pointer font-medium">Ver Resultado Completo</summary>
              <pre className="text-xs bg-secondary/20 p-4 rounded overflow-auto">{JSON.stringify(result, null, 2)}</pre>
            </details>
          </div>
        )}
      </CardContent>
    </Card>
  )
}