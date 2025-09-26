"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export async function actualizarPerfilAction(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  
  if (!user) redirect("/auth/login");

  const nombre = (formData.get("full_name") as string || "").trim();
  const telefono = (formData.get("phone") as string || "").trim() || null;
  const domicilio = (formData.get("address") as string || "").trim() || null;
  const contactoNombre = (formData.get("emergency_contact_name") as string || "").trim() || null;
  const contactoTel = (formData.get("emergency_contact_phone") as string || "").trim() || null;
  const avatarFile = formData.get("avatar_file") as File | null;

  console.log("Avatar file:", avatarFile);
  console.log("Avatar file size:", avatarFile?.size);
  console.log("Avatar file type:", avatarFile?.type);

  // 1) Subir avatar si existe
  let avatar_url: string | undefined = undefined;
  if (avatarFile && avatarFile.size > 0 && avatarFile.name !== "undefined") {
    try {
      // Validar que el archivo sea una imagen
      if (!avatarFile.type.startsWith('image/')) {
        throw new Error("El archivo debe ser una imagen");
      }

      // Validar tamaño máximo (5MB)
      if (avatarFile.size > 5 * 1024 * 1024) {
        throw new Error("El archivo es muy grande (máximo 5MB)");
      }

      const fileExtension = avatarFile.name.split('.').pop() || 'jpg';
      const fileName = `${Date.now()}.${fileExtension}`;
      const filePath = `${user.id}/${fileName}`;
      
      console.log("Uploading to path:", filePath);

      const { data: uploadData, error: upErr } = await supabase.storage
        .from("avatars")
        .upload(filePath, avatarFile, { 
          upsert: true, 
          contentType: avatarFile.type 
        });

      console.log("Upload result:", { uploadData, upErr });

      if (upErr) {
        console.error("Upload error:", upErr);
        throw new Error(`Error al subir avatar: ${upErr.message}`);
      }

      const { data: pub } = supabase.storage.from("avatars").getPublicUrl(filePath);
      avatar_url = pub.publicUrl;
      console.log("Public URL:", avatar_url);

    } catch (error) {
      console.error("Avatar upload error:", error);
      throw error;
    }
  }

  try {
    // 2) Actualizar public.users
    const updateUsers: Record<string, any> = { full_name: nombre };
    if (telefono !== undefined) updateUsers.phone = telefono;
    if (avatar_url) updateUsers.avatar_url = avatar_url;

    const { error: uErr } = await supabase
      .from("users")
      .update(updateUsers)
      .eq("id", user.id);
      
    if (uErr) {
      console.error("Users update error:", uErr);
      throw new Error(`No se pudo actualizar el perfil de usuario: ${uErr.message}`);
    }

    // 3) Actualizar public.employees
    const { error: eErr } = await supabase
      .from("employees")
      .update({ 
        address: domicilio, 
        emergency_contact_name: contactoNombre, 
        emergency_contact_phone: contactoTel 
      })
      .eq("user_id", user.id);
      
    if (eErr) {
      console.error("Employees update error:", eErr);
      throw new Error(`No se pudo actualizar los datos laborales: ${eErr.message}`);
    }

    redirect("/employee/profile?actualizado=1");
    
  } catch (error) {
    console.error("Database update error:", error);
    throw error;
  }
}