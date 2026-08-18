import { NextResponse } from "next/server";
import { getPayment } from "@/lib/yookassa";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: Request) {
  const body = (await request.json()) as { object?: { id?: string } };
  const paymentId = body.object?.id;

  if (!paymentId) {
    return NextResponse.json({ error: "Нет id платежа" }, { status: 400 });
  }

  // Не доверяем статусу из тела вебхука - запрашиваем платёж напрямую у YooKassa.
  const payment = await getPayment(paymentId);

  if (payment.status !== "succeeded") {
    return NextResponse.json({ ok: true });
  }

  const companyId = payment.metadata.companyId;
  const tariffCode = payment.metadata.tariffCode;

  if (!companyId || !tariffCode) {
    return NextResponse.json({ error: "Нет metadata в платеже" }, { status: 400 });
  }

  const admin = createAdminClient();
  const periodEnd = new Date();
  periodEnd.setMonth(periodEnd.getMonth() + 1);

  await admin.from("subscriptions").insert({
    company_id: companyId,
    tariff_code: tariffCode,
    status: "active",
    current_period_end: periodEnd.toISOString(),
    yookassa_payment_id: payment.id,
  });

  await admin.from("companies").update({ tariff_code: tariffCode }).eq("id", companyId);

  return NextResponse.json({ ok: true });
}
