import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Нейро-РОП — AI-контроль отдела продаж",
  description:
    "AI-ассистент руководителя отдела продаж: анализ переписок, live-подсказки менеджерам, авто-дожим лидов и дашборд собственника.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru">
      <body>{children}</body>
    </html>
  );
}
