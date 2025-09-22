import { createClient } from "@/lib/supabase/server"
import { EmployeeLayout } from "@/components/layout/employee-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { User, Mail, Phone, Calendar, MapPin, Briefcase, Building } from "lucide-react"

export default async function EmployeeProfilePage() {
  const supabase = await createClient()

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null

  // Get user and employee data
  const [{ data: userData }, { data: employeeData }] = await Promise.all([
    supabase.from("users").select("*").eq("id", user.id).single(),
    supabase.from("employees").select("*").eq("user_id", user.id).single(),
  ])

  if (!userData || !employeeData) return null

  return (
    <EmployeeLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold cyber-text">Mi Perfil</h1>
          <p className="text-muted-foreground">Información personal y laboral</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Personal Information */}
          <Card className="cyber-border border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5 text-primary" />
                Información Personal
              </CardTitle>
              <CardDescription>Datos personales y de contacto</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center space-x-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={userData.avatar_url || "/placeholder.svg"} />
                  <AvatarFallback className="bg-primary/20 text-primary text-lg">
                    {userData.full_name
                      .split(" ")
                      .map((n: string) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-xl font-semibold cyber-text">{userData.full_name}</h3>
                  <p className="text-muted-foreground">{employeeData.position}</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Mail className="h-4 w-4 text-primary" />
                  <div>
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p className="font-medium">{userData.email}</p>
                  </div>
                </div>

                {userData.phone && (
                  <div className="flex items-center space-x-3">
                    <Phone className="h-4 w-4 text-primary" />
                    <div>
                      <p className="text-sm text-muted-foreground">Teléfono</p>
                      <p className="font-medium">{userData.phone}</p>
                    </div>
                  </div>
                )}

                {employeeData.address && (
                  <div className="flex items-center space-x-3">
                    <MapPin className="h-4 w-4 text-primary" />
                    <div>
                      <p className="text-sm text-muted-foreground">Dirección</p>
                      <p className="font-medium">{employeeData.address}</p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Work Information */}
          <Card className="cyber-border border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="h-5 w-5 text-primary" />
                Información Laboral
              </CardTitle>
              <CardDescription>Detalles de tu empleo</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">ID Empleado</p>
                  <p className="font-medium font-mono">{employeeData.employee_id}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Estado</p>
                  <Badge
                    variant={employeeData.status === "active" ? "default" : "secondary"}
                    className={employeeData.status === "active" ? "bg-green-500/20 text-green-400" : ""}
                  >
                    {employeeData.status === "active" ? "Activo" : "Inactivo"}
                  </Badge>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Briefcase className="h-4 w-4 text-primary" />
                  <div>
                    <p className="text-sm text-muted-foreground">Posición</p>
                    <p className="font-medium">{employeeData.position}</p>
                  </div>
                </div>

                {employeeData.department && (
                  <div className="flex items-center space-x-3">
                    <Building className="h-4 w-4 text-primary" />
                    <div>
                      <p className="text-sm text-muted-foreground">Departamento</p>
                      <p className="font-medium">{employeeData.department}</p>
                    </div>
                  </div>
                )}

                <div className="flex items-center space-x-3">
                  <Calendar className="h-4 w-4 text-primary" />
                  <div>
                    <p className="text-sm text-muted-foreground">Fecha de Ingreso</p>
                    <p className="font-medium">{new Date(employeeData.hire_date).toLocaleDateString()}</p>
                  </div>
                </div>

                {employeeData.salary && (
                  <div className="flex items-center space-x-3">
                    <div className="h-4 w-4 text-primary">$</div>
                    <div>
                      <p className="text-sm text-muted-foreground">Salario</p>
                      <p className="font-medium">${employeeData.salary.toLocaleString()}</p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Emergency Contact */}
          {(employeeData.emergency_contact_name || employeeData.emergency_contact_phone) && (
            <Card className="cyber-border border-primary/20 md:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Phone className="h-5 w-5 text-primary" />
                  Contacto de Emergencia
                </CardTitle>
                <CardDescription>Información de contacto en caso de emergencia</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {employeeData.emergency_contact_name && (
                    <div>
                      <p className="text-sm text-muted-foreground">Nombre</p>
                      <p className="font-medium">{employeeData.emergency_contact_name}</p>
                    </div>
                  )}
                  {employeeData.emergency_contact_phone && (
                    <div>
                      <p className="text-sm text-muted-foreground">Teléfono</p>
                      <p className="font-medium">{employeeData.emergency_contact_phone}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </EmployeeLayout>
  )
}