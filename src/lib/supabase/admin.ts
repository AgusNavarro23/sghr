import { createClient } from "@supabase/supabase-js";


export function crearClienteAdmin() {
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY; // solo server
if (!url || !key) throw new Error("Faltan envs de Supabase");


return createClient(url, key, {
auth: { autoRefreshToken: false, persistSession: false },
global: { headers: { "X-Client-Info": "hr-admin-client" } },
});
}