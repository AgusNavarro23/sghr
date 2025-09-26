"use client";


import * as React from "react";
import { useTransition } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { actualizarPerfilAction } from "./actions";


const esquema = z.object({
full_name: z.string().min(3, "Mínimo 3 caracteres"),
phone: z.string().optional(),
address: z.string().optional(),
emergency_contact_name: z.string().optional(),
emergency_contact_phone: z.string().optional(),
avatar_file: z.any().optional(),
});


export default function EditarPerfilForm({ userData, employeeData }: { userData: any; employeeData: any }) {
const [pending, startTransition] = useTransition();


const form = useForm<z.infer<typeof esquema>>({
resolver: zodResolver(esquema),
defaultValues: {
full_name: userData.full_name ?? "",
phone: userData.phone ?? "",
address: employeeData.address ?? "",
emergency_contact_name: employeeData.emergency_contact_name ?? "",
emergency_contact_phone: employeeData.emergency_contact_phone ?? "",
},
});


function onSubmit(values: z.infer<typeof esquema>) {
const fd = new FormData();
for (const [k, v] of Object.entries(values)) {
if (k === "avatar_file") continue;
fd.append(k, (v as string) ?? "");
}
const fileInput = (document.getElementById("avatar_file") as HTMLInputElement | null)?.files?.[0];
if (fileInput) fd.append("avatar_file", fileInput);


startTransition(async () => {
await actualizarPerfilAction(fd);
});
}


return (
	<Card className="cyber-border border-prmary/20">
        <CardHeader>
            <CardTitle className="cyber-text">Editar Perfil</CardTitle>
            <CardDescription>Actualizá tus datos personales y de contacto</CardDescription>
        </CardHeader>
        <CardContent>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
<FormField name="full_name" control={form.control} render={({ field }) => (
<FormItem>
<FormLabel>Nombre completo</FormLabel>
<FormControl>
<Input {...field} />
</FormControl>
<FormMessage />
</FormItem>
)} />
<FormField name="phone" control={form.control} render={({ field }) => (
<FormItem>
<FormLabel>Teléfono</FormLabel>
<FormControl>
<Input {...field} />
</FormControl>
<FormMessage />
</FormItem>
)} />
<FormField name="address" control={form.control} render={({ field }) => (
<FormItem className="md:col-span-2">
<FormLabel>Domicilio</FormLabel>
<FormControl>
<Input {...field} />
</FormControl>
<FormMessage />
</FormItem>
)} />
<FormField name="emergency_contact_name" control={form.control} render={({ field }) => (
<FormItem>
<FormLabel>Contacto de emergencia (nombre)</FormLabel>
<FormControl>
<Input {...field} />
</FormControl>
<FormMessage />
</FormItem>
)} />
<FormField name="emergency_contact_phone" control={form.control} render={({ field }) => (
<FormItem>
<FormLabel>Contacto de emergencia (teléfono)</FormLabel>
<FormControl>
<Input {...field} />
</FormControl>
<FormMessage />
</FormItem>
)} />
<FormItem className="md:col-span-2">
<FormLabel>Avatar (opcional)</FormLabel>
<FormControl>
<Input id="avatar_file" type="file" accept="image/*" />
</FormControl>
<FormMessage />
</FormItem>
</div>
<div className="flex items-center gap-3">
<Button type="submit" className="cyber-glow" disabled={pending}>
{pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Guardar cambios
</Button>
<Button type="button" variant="outline" className="cyber-border bg-transparent" onClick={() => history.back()}>
Cancelar
</Button>
</div>
                </form>
            </Form>
        </CardContent>
    </Card>
);
}
