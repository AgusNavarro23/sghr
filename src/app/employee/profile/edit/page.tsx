import { EmployeeLayout } from "@/components/layout/employee-layout";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import EditarPerfilForm from "./perfil.form";


export default async function EditProfilePage() {
const supabase = await createClient();
const {
data: { user },
} = await supabase.auth.getUser();
if (!user) redirect("/auth/login");


const [{ data: userData }, { data: employeeData }] = await Promise.all([
supabase.from("users").select("*").eq("id", user.id).single(),
supabase.from("employees").select("*").eq("user_id", user.id).single(),
]);


if (!userData || !employeeData) redirect("/employee/profile");


return (
<EmployeeLayout>
<div className="max-w-3xl mx-auto">
<EditarPerfilForm userData={userData} employeeData={employeeData} />
</div>
</EmployeeLayout>
);
}