import type React from "react"
import { EmployeeSidebar } from "./employee-sidebar"

interface EmployeeLayoutProps {
  children: React.ReactNode
}

export function EmployeeLayout({ children }: EmployeeLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <EmployeeSidebar />
      <div className="lg:pl-64">
        <main className="p-6">{children}</main>
      </div>
    </div>
  )
}
