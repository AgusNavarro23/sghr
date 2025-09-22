"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { EmployerLayout } from "@/components/layout/employer-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Save, User, Building, Calendar, Phone, Mail, MapPin, AlertCircle, Lock } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface FormData {
  // Datos del usuario
  full_name: string
  email: string
  phone: string
  password: string
  confirm_password: string
  
  // Datos del empleado
  employee_id: string
  department: string
  position: string
  hire_date: string
  salary: string
  address: string
  emergency_contact_name: string
  emergency_contact_phone: string
  status: 'active' | 'inactive'
}

interface FormErrors {
  [key: string]: string
}

export default function NewEmployeePage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string>("")
  const [success, setSuccess] = useState(false)
  const [errors, setErrors] = useState<FormErrors>({})
  const [createdEmail, setCreatedEmail] = useState<string>("")
  
  const [formData, setFormData] = useState<FormData>({
    full_name: "",
    email: "",
    phone: "",
    password: "",
    confirm_password: "",
    employee_id: "",
    department: "",
    position: "",
    hire_date: "",
    salary: "",
    address: "",
    emergency_contact_name: "",
    emergency_contact_phone: "",
    status: "active"
  })

  // Generar ID de empleado automático
  const generateEmployeeId = () => {
    const timestamp = Date.now().toString().slice(-6)
    const random = Math.floor(Math.random() * 100).toString().padStart(2, '0')
    return `EMP${timestamp}${random}`
  }

  // Validar formulario
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}
    
    if (!formData.full_name.trim()) newErrors.full_name = "El nombre completo es requerido"
    if (!formData.email.trim()) newErrors.email = "El email es requerido"
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = "Email inválido"
    
    if (!formData.password) newErrors.password = "La contraseña es requerida"
    else if (formData.password.length < 8) newErrors.password = "La contraseña debe tener al menos 8 caracteres"
    else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password = "La contraseña debe contener al menos una mayúscula, una minúscula y un número"
    }
    
    if (!formData.confirm_password) newErrors.confirm_password = "Confirma la contraseña"
    else if (formData.password !== formData.confirm_password) newErrors.confirm_password = "Las contraseñas no coinciden"
    
    if (!formData.employee_id.trim()) newErrors.employee_id = "El ID de empleado es requerido"
    if (!formData.position.trim()) newErrors.position = "La posición es requerida"
    if (!formData.hire_date) newErrors.hire_date = "La fecha de contratación es requerida"
    
    if (formData.salary && isNaN(parseFloat(formData.salary))) newErrors.salary = "El salario debe ser un número válido"
    
    if (formData.phone && !/^\+?[\d\s\-\(\)]+$/.test(formData.phone)) newErrors.phone = "Teléfono inválido"
    if (formData.emergency_contact_phone && !/^\+?[\d\s\-\(\)]+$/.test(formData.emergency_contact_phone)) {
      newErrors.emergency_contact_phone = "Teléfono de emergencia inválido"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Manejar cambios en el formulario
  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Limpiar error del campo cuando el usuario empieza a escribir
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }))
    }
  }

  // Enviar formulario
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return

    setIsLoading(true)
    setError("")
    
    try {
      const supabase = createClient()
      
      // 1. Crear usuario en Supabase Auth con la contraseña proporcionada
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.full_name,
            role: 'employee'
          },
          emailRedirectTo: undefined // Evita el email de confirmación automático
        }
      })

      if (authError) {
        if (authError.message.includes('already registered')) {
          setError("Ya existe un usuario con este email")
        } else {
          setError(`Error en el registro: ${authError.message}`)
        }
        return
      }

      if (!authData.user) {
        setError("Error al crear el usuario en el sistema de autenticación")
        return
      }

      // 2. Crear registro en la tabla users
      const { data: userData, error: userError } = await supabase
        .from('users')
        .insert({
          id: authData.user.id, // Usar el ID de auth
          email: formData.email,
          full_name: formData.full_name,
          role: 'employee',
          phone: formData.phone || null
        })
        .select()
        .single()

      if (userError) {
        // Si falla, intentar eliminar el usuario de auth (aunque puede no ser posible desde el cliente)
        console.error("Error al crear usuario en tabla users:", userError)
        setError(`Error al crear perfil de usuario: ${userError.message}`)
        return
      }

      // 3. Crear empleado en la tabla employees
      const { error: employeeError } = await supabase
        .from('employees')
        .insert({
          user_id: authData.user.id,
          employee_id: formData.employee_id,
          department: formData.department || null,
          position: formData.position,
          hire_date: formData.hire_date,
          salary: formData.salary ? parseFloat(formData.salary) : null,
          address: formData.address || null,
          emergency_contact_name: formData.emergency_contact_name || null,
          emergency_contact_phone: formData.emergency_contact_phone || null,
          status: formData.status
        })

      if (employeeError) {
        // Si falla la creación del empleado, eliminar registros creados
        await supabase.from('users').delete().eq('id', authData.user.id)
        
        if (employeeError.code === '23505') {
          setError("Ya existe un empleado con este ID")
        } else {
          setError(`Error al crear empleado: ${employeeError.message}`)
        }
        return
      }

      setCreatedEmail(formData.email)
      setSuccess(true)
      setTimeout(() => {
        router.push('/employer/employees')
      }, 3000) // Más tiempo para leer la información
      
    } catch (err) {
      setError("Error inesperado. Por favor intenta nuevamente.")
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  if (success) {
    return (
      <EmployerLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <Card className="cyber-border border-green-500/50 bg-green-500/10 max-w-md">
            <CardContent className="text-center py-12">
              <div className="text-6xl mb-4">✅</div>
              <h2 className="text-2xl font-bold text-green-400 mb-4">¡Empleado Creado Exitosamente!</h2>
              <div className="text-left space-y-3 mb-6 p-4 bg-primary/10 rounded-lg cyber-border">
                <p className="text-sm font-semibold text-primary">Credenciales de acceso:</p>
                <p className="text-sm text-muted-foreground">
                  • Email: {createdEmail}
                </p>
                <p className="text-sm text-muted-foreground">
                  • Contraseña: La que estableciste en el formulario
                </p>
                <p className="text-sm text-muted-foreground">
                  • El empleado ya puede acceder al sistema con estas credenciales
                </p>
              </div>
              <p className="text-muted-foreground">Redirigiendo a la lista de empleados...</p>
            </CardContent>
          </Card>
        </div>
      </EmployerLayout>
    )
  }

  return (
    <EmployerLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center space-x-4">
          <Button variant="outline" size="sm" asChild className="cyber-border">
            <Link href="/employer/employees">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold cyber-text">Nuevo Empleado</h1>
            <p className="text-muted-foreground">Completa la información del nuevo empleado</p>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <Alert variant="destructive" className="cyber-border border-red-500/50">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            
            {/* Información Personal */}
            <Card className="cyber-border border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <User className="mr-2 h-5 w-5" />
                  Información Personal
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="full_name">Nombre Completo *</Label>
                  <Input
                    id="full_name"
                    value={formData.full_name}
                    onChange={(e) => handleInputChange('full_name', e.target.value)}
                    className={`cyber-border ${errors.full_name ? 'border-red-500' : ''}`}
                    placeholder="Ingresa el nombre completo"
                  />
                  {errors.full_name && <p className="text-sm text-red-500">{errors.full_name}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className={`cyber-border ${errors.email ? 'border-red-500' : ''}`}
                    placeholder="email@empresa.com"
                  />
                  {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Teléfono</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    className={`cyber-border ${errors.phone ? 'border-red-500' : ''}`}
                    placeholder="+54 9 XXX XXX XXXX"
                  />
                  {errors.phone && <p className="text-sm text-red-500">{errors.phone}</p>}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="password">Contraseña *</Label>
                    <Input
                      id="password"
                      type="password"
                      value={formData.password}
                      onChange={(e) => handleInputChange('password', e.target.value)}
                      className={`cyber-border ${errors.password ? 'border-red-500' : ''}`}
                      placeholder="Mínimo 8 caracteres"
                    />
                    {errors.password && <p className="text-sm text-red-500">{errors.password}</p>}
                    {!errors.password && formData.password && (
                      <div className="text-xs text-muted-foreground">
                        <p className={formData.password.length >= 8 ? "text-green-500" : "text-red-500"}>
                          ✓ Mínimo 8 caracteres
                        </p>
                        <p className={/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password) ? "text-green-500" : "text-red-500"}>
                          ✓ Mayúscula, minúscula y número
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirm_password">Confirmar Contraseña *</Label>
                    <Input
                      id="confirm_password"
                      type="password"
                      value={formData.confirm_password}
                      onChange={(e) => handleInputChange('confirm_password', e.target.value)}
                      className={`cyber-border ${errors.confirm_password ? 'border-red-500' : ''}`}
                      placeholder="Repite la contraseña"
                    />
                    {errors.confirm_password && <p className="text-sm text-red-500">{errors.confirm_password}</p>}
                    {!errors.confirm_password && formData.confirm_password && formData.password === formData.confirm_password && (
                      <p className="text-xs text-green-500">✓ Las contraseñas coinciden</p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Dirección</Label>
                  <Textarea
                    id="address"
                    value={formData.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    className="cyber-border"
                    placeholder="Dirección completa"
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Información Laboral */}
            <Card className="cyber-border border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Building className="mr-2 h-5 w-5" />
                  Información Laboral
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="employee_id">ID Empleado *</Label>
                    <div className="flex">
                      <Input
                        id="employee_id"
                        value={formData.employee_id}
                        onChange={(e) => handleInputChange('employee_id', e.target.value)}
                        className={`cyber-border ${errors.employee_id ? 'border-red-500' : ''}`}
                        placeholder="EMP001"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handleInputChange('employee_id', generateEmployeeId())}
                        className="ml-2 cyber-border"
                      >
                        Auto
                      </Button>
                    </div>
                    {errors.employee_id && <p className="text-sm text-red-500">{errors.employee_id}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="status">Estado</Label>
                    <Select value={formData.status} onValueChange={(value: 'active' | 'inactive') => handleInputChange('status', value)}>
                      <SelectTrigger className="cyber-border">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Activo</SelectItem>
                        <SelectItem value="inactive">Inactivo</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="position">Posición/Cargo *</Label>
                  <Input
                    id="position"
                    value={formData.position}
                    onChange={(e) => handleInputChange('position', e.target.value)}
                    className={`cyber-border ${errors.position ? 'border-red-500' : ''}`}
                    placeholder="Desarrollador, Gerente, etc."
                  />
                  {errors.position && <p className="text-sm text-red-500">{errors.position}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="department">Departamento</Label>
                  <Input
                    id="department"
                    value={formData.department}
                    onChange={(e) => handleInputChange('department', e.target.value)}
                    className="cyber-border"
                    placeholder="IT, RRHH, Ventas, etc."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="hire_date">Fecha de Contratación *</Label>
                    <Input
                      id="hire_date"
                      type="date"
                      value={formData.hire_date}
                      onChange={(e) => handleInputChange('hire_date', e.target.value)}
                      className={`cyber-border ${errors.hire_date ? 'border-red-500' : ''}`}
                    />
                    {errors.hire_date && <p className="text-sm text-red-500">{errors.hire_date}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="salary">Salario (opcional)</Label>
                    <Input
                      id="salary"
                      type="number"
                      step="0.01"
                      value={formData.salary}
                      onChange={(e) => handleInputChange('salary', e.target.value)}
                      className={`cyber-border ${errors.salary ? 'border-red-500' : ''}`}
                      placeholder="0.00"
                    />
                    {errors.salary && <p className="text-sm text-red-500">{errors.salary}</p>}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Contacto de Emergencia */}
            <Card className="cyber-border border-primary/20 lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Phone className="mr-2 h-5 w-5" />
                  Contacto de Emergencia
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="emergency_contact_name">Nombre del Contacto</Label>
                    <Input
                      id="emergency_contact_name"
                      value={formData.emergency_contact_name}
                      onChange={(e) => handleInputChange('emergency_contact_name', e.target.value)}
                      className="cyber-border"
                      placeholder="Nombre completo"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="emergency_contact_phone">Teléfono de Emergencia</Label>
                    <Input
                      id="emergency_contact_phone"
                      value={formData.emergency_contact_phone}
                      onChange={(e) => handleInputChange('emergency_contact_phone', e.target.value)}
                      className={`cyber-border ${errors.emergency_contact_phone ? 'border-red-500' : ''}`}
                      placeholder="+54 9 XXX XXX XXXX"
                    />
                    {errors.emergency_contact_phone && <p className="text-sm text-red-500">{errors.emergency_contact_phone}</p>}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Botones de Acción */}
          <Card className="cyber-border border-primary/20">
            <CardContent className="pt-6">
              <div className="flex gap-4 justify-end">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                  className="cyber-border"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="cyber-glow"
                >
                  {isLoading ? (
                    <>
                      <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-background border-t-foreground" />
                      Guardando...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Crear Empleado
                    </>
                  )}
                </Button>
              </div>
              <p className="text-sm text-muted-foreground mt-4">
                * Campos obligatorios
              </p>
            </CardContent>
          </Card>
        </form>
      </div>
    </EmployerLayout>
  )
}