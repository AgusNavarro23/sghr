"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon, Loader2, Send } from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { cn } from "@/lib/utils"

interface LeaveType {
  id: string
  name: string
  description: string
  max_days_per_year: number
}

interface LeaveRequestFormProps {
  leaveTypes: LeaveType[]
  employeeId: string
}

export function LeaveRequestForm({ leaveTypes, employeeId }: LeaveRequestFormProps) {
  const [leaveTypeId, setLeaveTypeId] = useState("")
  const [startDate, setStartDate] = useState<Date>()
  const [endDate, setEndDate] = useState<Date>()
  const [reason, setReason] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()
  const supabase = createClient()

  const calculateDays = () => {
    if (!startDate || !endDate) return 0
    const diffTime = Math.abs(endDate.getTime() - startDate.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1
    return diffDays
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    if (!startDate || !endDate || !leaveTypeId) {
      setError("Por favor completa todos los campos requeridos")
      setLoading(false)
      return
    }

    if (endDate < startDate) {
      setError("La fecha de fin debe ser posterior a la fecha de inicio")
      setLoading(false)
      return
    }

    const daysRequested = calculateDays()

    try {
      const { error } = await supabase.from("leave_requests").insert({
        employee_id: employeeId,
        leave_type_id: leaveTypeId,
        start_date: startDate.toISOString().split("T")[0],
        end_date: endDate.toISOString().split("T")[0],
        days_requested: daysRequested,
        reason: reason || null,
        status: "pending",
      })

      if (error) {
        setError("Error al crear la solicitud: " + error.message)
        return
      }

      router.push("/employee/leaves")
    } catch (err) {
      setError("Error inesperado al crear la solicitud")
    } finally {
      setLoading(false)
    }
  }

  const selectedLeaveType = leaveTypes.find((type) => type.id === leaveTypeId)

  return (
    <Card className="cyber-border border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Send className="h-5 w-5 text-primary" />
          Nueva Solicitud de Licencia
        </CardTitle>
        <CardDescription>Completa el formulario para solicitar una licencia</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="leaveType">Tipo de Licencia *</Label>
            <Select value={leaveTypeId} onValueChange={setLeaveTypeId} required>
              <SelectTrigger className="cyber-border">
                <SelectValue placeholder="Selecciona el tipo de licencia" />
              </SelectTrigger>
              <SelectContent>
                {leaveTypes.map((type) => (
                  <SelectItem key={type.id} value={type.id}>
                    <div>
                      <p className="font-medium">{type.name}</p>
                      <p className="text-sm text-muted-foreground">{type.description}</p>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedLeaveType && (
              <p className="text-sm text-muted-foreground">Máximo {selectedLeaveType.max_days_per_year} días por año</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Fecha de Inicio *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal cyber-border bg-transparent",
                      !startDate && "text-muted-foreground",
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {startDate ? format(startDate, "PPP", { locale: es }) : "Selecciona fecha"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={startDate}
                    onSelect={setStartDate}
                    disabled={(date) => date < new Date()}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label>Fecha de Fin *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal cyber-border bg-transparent",
                      !endDate && "text-muted-foreground",
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {endDate ? format(endDate, "PPP", { locale: es }) : "Selecciona fecha"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={endDate}
                    onSelect={setEndDate}
                    disabled={(date) => date < (startDate || new Date())}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {startDate && endDate && (
            <div className="p-4 bg-secondary/20 rounded-lg">
              <p className="text-sm text-muted-foreground">Días solicitados:</p>
              <p className="text-lg font-bold text-primary cyber-text">{calculateDays()} días</p>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="reason">Motivo (Opcional)</Label>
            <Textarea
              id="reason"
              placeholder="Describe el motivo de tu solicitud..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="cyber-border"
              rows={4}
            />
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="flex gap-4">
            <Button type="submit" className="flex-1 cyber-glow" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Enviando...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Enviar Solicitud
                </>
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              className="cyber-border bg-transparent"
            >
              Cancelar
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}