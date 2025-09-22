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
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon, Loader2, DollarSign, Calculator } from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { cn } from "@/lib/utils"

interface Employee {
  id: string
  employee_id: string
  salary: number
  users: {
    full_name: string
    email: string
  }
}

interface PayrollFormProps {
  employees: Employee[]
}

export function PayrollForm({ employees }: PayrollFormProps) {
  const [selectedEmployeeId, setSelectedEmployeeId] = useState("")
  const [payPeriodStart, setPayPeriodStart] = useState<Date>()
  const [payPeriodEnd, setPayPeriodEnd] = useState<Date>()
  const [grossSalary, setGrossSalary] = useState("")
  const [deductions, setDeductions] = useState("")
  const [bonus, setBonus] = useState("")
  const [overtimeHours, setOvertimeHours] = useState("")
  const [overtimePay, setOvertimePay] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()
  const supabase = createClient()

  const selectedEmployee = employees.find((emp) => emp.id === selectedEmployeeId)

  const calculateNetSalary = () => {
    const gross = Number.parseFloat(grossSalary) || 0
    const deduct = Number.parseFloat(deductions) || 0
    const bonusAmount = Number.parseFloat(bonus) || 0
    const overtimeAmount = Number.parseFloat(overtimePay) || 0
    return gross + bonusAmount + overtimeAmount - deduct
  }

  const handleEmployeeSelect = (employeeId: string) => {
    setSelectedEmployeeId(employeeId)
    const employee = employees.find((emp) => emp.id === employeeId)
    if (employee) {
      setGrossSalary(employee.salary.toString())
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    if (!selectedEmployeeId || !payPeriodStart || !payPeriodEnd || !grossSalary) {
      setError("Por favor completa todos los campos requeridos")
      setLoading(false)
      return
    }

    if (payPeriodEnd < payPeriodStart) {
      setError("La fecha de fin debe ser posterior a la fecha de inicio")
      setLoading(false)
      return
    }

    const netSalary = calculateNetSalary()

    try {
      const { error } = await supabase.from("payroll_records").insert({
        employee_id: selectedEmployeeId,
        pay_period_start: payPeriodStart.toISOString().split("T")[0],
        pay_period_end: payPeriodEnd.toISOString().split("T")[0],
        gross_salary: Number.parseFloat(grossSalary),
        deductions: Number.parseFloat(deductions) || 0,
        net_salary: netSalary,
        bonus: Number.parseFloat(bonus) || 0,
        overtime_hours: Number.parseFloat(overtimeHours) || 0,
        overtime_pay: Number.parseFloat(overtimePay) || 0,
        status: "draft",
      })

      if (error) {
        setError("Error al crear el recibo: " + error.message)
        return
      }

      router.push("/employer/payroll")
    } catch (err) {
      setError("Error inesperado al crear el recibo")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="cyber-border border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="h-5 w-5 text-primary" />
          Nuevo Recibo de Sueldo
        </CardTitle>
        <CardDescription>Genera un recibo de sueldo para un empleado</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="employee">Empleado *</Label>
            <Select value={selectedEmployeeId} onValueChange={handleEmployeeSelect} required>
              <SelectTrigger className="cyber-border">
                <SelectValue placeholder="Selecciona un empleado" />
              </SelectTrigger>
              <SelectContent>
                {employees.map((employee) => (
                  <SelectItem key={employee.id} value={employee.id}>
                    <div>
                      <p className="font-medium">{employee.users.full_name}</p>
                      <p className="text-sm text-muted-foreground">
                        ID: {employee.employee_id} - Salario: ${employee.salary.toLocaleString()}
                      </p>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Inicio del Período *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal cyber-border bg-transparent",
                      !payPeriodStart && "text-muted-foreground",
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {payPeriodStart ? format(payPeriodStart, "PPP", { locale: es }) : "Selecciona fecha"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar mode="single" selected={payPeriodStart} onSelect={setPayPeriodStart} initialFocus />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label>Fin del Período *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal cyber-border bg-transparent",
                      !payPeriodEnd && "text-muted-foreground",
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {payPeriodEnd ? format(payPeriodEnd, "PPP", { locale: es }) : "Selecciona fecha"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={payPeriodEnd}
                    onSelect={setPayPeriodEnd}
                    disabled={(date) => date < (payPeriodStart || new Date())}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="grossSalary">Salario Bruto *</Label>
              <Input
                id="grossSalary"
                type="number"
                step="0.01"
                placeholder="0.00"
                value={grossSalary}
                onChange={(e) => setGrossSalary(e.target.value)}
                required
                className="cyber-border"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="deductions">Deducciones</Label>
              <Input
                id="deductions"
                type="number"
                step="0.01"
                placeholder="0.00"
                value={deductions}
                onChange={(e) => setDeductions(e.target.value)}
                className="cyber-border"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="bonus">Bonificación</Label>
              <Input
                id="bonus"
                type="number"
                step="0.01"
                placeholder="0.00"
                value={bonus}
                onChange={(e) => setBonus(e.target.value)}
                className="cyber-border"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="overtimeHours">Horas Extra</Label>
              <Input
                id="overtimeHours"
                type="number"
                step="0.5"
                placeholder="0"
                value={overtimeHours}
                onChange={(e) => setOvertimeHours(e.target.value)}
                className="cyber-border"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="overtimePay">Pago por Horas Extra</Label>
            <Input
              id="overtimePay"
              type="number"
              step="0.01"
              placeholder="0.00"
              value={overtimePay}
              onChange={(e) => setOvertimePay(e.target.value)}
              className="cyber-border"
            />
          </div>

          {(grossSalary || deductions || bonus || overtimePay) && (
            <div className="p-4 bg-secondary/20 rounded-lg space-y-2">
              <div className="flex items-center gap-2 mb-2">
                <Calculator className="h-4 w-4 text-primary" />
                <p className="font-medium">Cálculo del Salario</p>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="flex justify-between">
                  <span>Salario Bruto:</span>
                  <span className="text-green-400">+${(Number.parseFloat(grossSalary) || 0).toLocaleString()}</span>
                </div>
                {bonus && Number.parseFloat(bonus) > 0 && (
                  <div className="flex justify-between">
                    <span>Bonificación:</span>
                    <span className="text-green-400">+${Number.parseFloat(bonus).toLocaleString()}</span>
                  </div>
                )}
                {overtimePay && Number.parseFloat(overtimePay) > 0 && (
                  <div className="flex justify-between">
                    <span>Horas Extra:</span>
                    <span className="text-green-400">+${Number.parseFloat(overtimePay).toLocaleString()}</span>
                  </div>
                )}
                {deductions && Number.parseFloat(deductions) > 0 && (
                  <div className="flex justify-between">
                    <span>Deducciones:</span>
                    <span className="text-red-400">-${Number.parseFloat(deductions).toLocaleString()}</span>
                  </div>
                )}
              </div>
              <div className="border-t border-border pt-2 mt-2">
                <div className="flex justify-between font-bold text-lg">
                  <span>Salario Neto:</span>
                  <span className="text-primary cyber-text">${calculateNetSalary().toLocaleString()}</span>
                </div>
              </div>
            </div>
          )}

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
                  Creando...
                </>
              ) : (
                <>
                  <DollarSign className="mr-2 h-4 w-4" />
                  Crear Recibo
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