import Link from "next/link";
import { TARIFFS } from "@/lib/tariffs";

export default function LandingPage() {
  return (
    <main className="mx-auto max-w-5xl px-6 py-20">
      <section className="text-center">
        <p className="mb-4 text-sm font-medium uppercase tracking-widest text-muted">
          Нейро-РОП
        </p>
        <h1 className="mx-auto max-w-3xl text-4xl font-semibold leading-tight sm:text-5xl">
          РОП, который никогда не спит и не косячит
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-muted">
          AI-ассистент руководителя отдела продаж. Анализирует переписки менеджеров,
          подсказывает в реальном времени, возвращает молчащих лидов и держит вас в курсе
          каждой сделки — без найма РОПа за 150 000 ₽/мес.
        </p>
        <div className="mt-10 flex items-center justify-center gap-4">
          <Link href="/signup" className="btn-accent">
            Попробовать 7 дней бесплатно
          </Link>
          <Link href="/login" className="btn-ghost">
            Войти
          </Link>
        </div>
      </section>

      <section className="mt-24 grid gap-6 sm:grid-cols-3">
        {TARIFFS.map((tariff) => (
          <div
            key={tariff.code}
            className={`card flex flex-col ${
              "highlighted" in tariff && tariff.highlighted
                ? "border-accent/60 ring-1 ring-accent/40"
                : ""
            }`}
          >
            <h3 className="text-lg font-semibold">{tariff.name}</h3>
            <p className="mt-1 text-sm text-muted">
              {tariff.managerLimit ? `до ${tariff.managerLimit} менеджеров` : "от 11 менеджеров"}
            </p>
            <p className="mt-4 text-3xl font-semibold">
              {tariff.priceRub.toLocaleString("ru-RU")}{" "}
              <span className="text-base font-normal text-muted">₽/мес</span>
            </p>
            <ul className="mt-6 flex-1 space-y-2 text-sm text-muted">
              {tariff.features.map((feature) => (
                <li key={feature} className="flex items-start gap-2">
                  <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                  {feature}
                </li>
              ))}
            </ul>
            <Link
              href="/signup"
              className={
                "highlighted" in tariff && tariff.highlighted ? "btn-accent mt-8" : "btn-ghost mt-8"
              }
            >
              Выбрать
            </Link>
          </div>
        ))}
      </section>
    </main>
  );
}
