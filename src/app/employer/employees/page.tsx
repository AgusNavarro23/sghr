import { createClient } from "@/lib/supabase/server"
import { EmployerLayout } from "@/components/layout/employer-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Plus, Mail, Phone, Calendar, MapPin, Users } from "lucide-react"
import Link from "next/link"

export default async function EmployeesPage() {
  const supabase = await createClient()

  const { data: employees } = await supabase
    .from("employees")
    .select(
      `
      *,
      users!inner(
        full_name,
        email,
        avatar_url,
        phone
      )
    `,
    )
    .order("created_at", { ascending: false })

  return (
    <EmployerLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold cyber-text">Empleados</h1>
            <p className="text-muted-foreground">Gestiona la información de tus empleados</p>
          </div>
          <Button asChild className="cyber-glow">
            <Link href="/employer/employees/new">
              <Plus className="mr-2 h-4 w-4" />
              Agregar Empleado
            </Link>
          </Button>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {employees?.map((employee) => (
            <Card
              key={employee.id}
              className="cyber-border border-primary/20 hover:cyber-glow transition-all duration-300"
            >
              <CardHeader>
                <div className="flex items-center space-x-4">
                  <Avatar>
                    <AvatarImage src={employee.users.avatar_url || "/placeholder.svg"} />
                    <AvatarFallback className="bg-primary/20 text-primary">
                      {employee.users.full_name
                        .split(" ")
                        .map((n: string) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-lg">{employee.users.full_name}</CardTitle>
                    <CardDescription>{employee.position}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">ID Empleado:</span>
                  <span className="text-sm font-mono">{employee.employee_id}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Departamento:</span>
                  <span className="text-sm">{employee.department || "No asignado"}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Estado:</span>
                  <Badge
                    variant={employee.status === "active" ? "default" : "secondary"}
                    className={employee.status === "active" ? "bg-green-500/20 text-green-400" : ""}
                  >
                    {employee.status === "active" ? "Activo" : "Inactivo"}
                  </Badge>
                </div>
                <div className="pt-2 space-y-2">
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Mail className="mr-2 h-4 w-4" />
                    {employee.users.email}
                  </div>
                  {employee.users.phone && (
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Phone className="mr-2 h-4 w-4" />
                      {employee.users.phone}
                    </div>
                  )}
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Calendar className="mr-2 h-4 w-4" />
                    Desde {new Date(employee.hire_date).toLocaleDateString()}
                  </div>
                  {employee.address && (
                    <div className="flex items-center text-sm text-muted-foreground">
                      <MapPin className="mr-2 h-4 w-4" />
                      {employee.address}
                    </div>
                  )}
                </div>
                <div className="pt-2">
                  <Button variant="outline" size="sm" className="w-full cyber-border bg-transparent">
                    Ver Detalles
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {(!employees || employees.length === 0) && (
          <Card className="cyber-border border-primary/20">
            <CardContent className="text-center py-12">
              <Users className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No hay empleados registrados</h3>
              <p className="text-muted-foreground mb-4">Comienza agregando tu primer empleado al sistema.</p>
              <Button asChild className="cyber-glow">
                <Link href="/employer/employees/new">
                  <Plus className="mr-2 h-4 w-4" />
                  Agregar Primer Empleado
                </Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </EmployerLayout>
  )
}