import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { signOut } from "./actions";

const NAV = [
  { href: "/dashboard", label: "Обзор" },
  { href: "/dashboard/dialogues", label: "Диалоги" },
  { href: "/dashboard/managers", label: "Менеджеры" },
  { href: "/dashboard/billing", label: "Тариф и оплата" },
];

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="flex min-h-screen">
      <aside className="flex w-64 shrink-0 flex-col border-r border-border p-6">
        <span className="text-lg font-semibold">Нейро-РОП</span>
        <nav className="mt-8 flex flex-col gap-1">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-xl px-3 py-2 text-sm text-muted transition-colors hover:bg-surface-hover hover:text-foreground"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="mt-auto space-y-2 pt-6 text-sm text-muted">
          <p className="truncate">{user?.email}</p>
          <form action={signOut}>
            <button type="submit" className="text-accent-light hover:underline">
              Выйти
            </button>
          </form>
        </div>
      </aside>
      <main className="flex-1 p-8">{children}</main>
    </div>
  );
}
