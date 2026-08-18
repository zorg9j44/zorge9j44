import { createClient as createSupabaseClient } from "@supabase/supabase-js";

/**
 * Service-role клиент. Обходит RLS - использовать только в доверенном
 * серверном коде (например, провижининг компании при регистрации),
 * никогда не импортировать в клиентские компоненты.
 */
export function createAdminClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } },
  );
}
