"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function signup(formData: FormData) {
  const company = String(formData.get("company") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!company || !email || !password) {
    redirect(`/signup?error=${encodeURIComponent("Заполните все поля")}`);
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({ email, password });

  if (error || !data.user) {
    redirect(`/signup?error=${encodeURIComponent(error?.message ?? "Не удалось зарегистрироваться")}`);
  }

  // Провижининг компании и профиля владельца - обходит RLS через service role,
  // это единственное доверенное место, где это допустимо.
  const admin = createAdminClient();

  const { data: companyRow, error: companyError } = await admin
    .from("companies")
    .insert({ name: company, owner_id: data.user!.id })
    .select("id")
    .single();

  if (companyError || !companyRow) {
    redirect(`/signup?error=${encodeURIComponent("Не удалось создать компанию, попробуйте снова")}`);
  }

  await admin.from("profiles").insert({
    id: data.user!.id,
    company_id: companyRow!.id,
    role: "owner",
  });

  redirect("/dashboard");
}
