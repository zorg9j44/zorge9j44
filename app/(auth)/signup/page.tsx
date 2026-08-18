import Link from "next/link";
import { signup } from "./actions";

export default function SignupPage({
  searchParams,
}: {
  searchParams: { error?: string };
}) {
  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6">
      <h1 className="text-2xl font-semibold">Регистрация компании</h1>
      <p className="mt-2 text-sm text-muted">7 дней бесплатно, без карты на старте.</p>

      <form action={signup} className="card mt-8 space-y-4">
        <div>
          <label htmlFor="company" className="mb-1.5 block text-sm text-muted">
            Название компании
          </label>
          <input
            id="company"
            name="company"
            type="text"
            required
            className="w-full rounded-xl border border-border bg-background px-4 py-2.5 outline-none focus:border-accent"
          />
        </div>
        <div>
          <label htmlFor="email" className="mb-1.5 block text-sm text-muted">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            className="w-full rounded-xl border border-border bg-background px-4 py-2.5 outline-none focus:border-accent"
          />
        </div>
        <div>
          <label htmlFor="password" className="mb-1.5 block text-sm text-muted">
            Пароль
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            minLength={8}
            className="w-full rounded-xl border border-border bg-background px-4 py-2.5 outline-none focus:border-accent"
          />
        </div>

        {searchParams.error && (
          <p className="text-sm text-danger">{searchParams.error}</p>
        )}

        <button type="submit" className="btn-accent w-full">
          Создать кабинет
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-muted">
        Уже есть аккаунт?{" "}
        <Link href="/login" className="text-accent-light">
          Войти
        </Link>
      </p>
    </main>
  );
}
