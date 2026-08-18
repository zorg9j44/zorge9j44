const YOOKASSA_API = "https://api.yookassa.ru/v3";

function authHeader() {
  const shopId = process.env.YOOKASSA_SHOP_ID!;
  const secretKey = process.env.YOOKASSA_SECRET_KEY!;
  return "Basic " + Buffer.from(`${shopId}:${secretKey}`).toString("base64");
}

export async function createPayment(params: {
  amountRub: number;
  description: string;
  returnUrl: string;
  metadata: Record<string, string>;
  idempotenceKey: string;
}) {
  const response = await fetch(`${YOOKASSA_API}/payments`, {
    method: "POST",
    headers: {
      Authorization: authHeader(),
      "Content-Type": "application/json",
      "Idempotence-Key": params.idempotenceKey,
    },
    body: JSON.stringify({
      amount: { value: params.amountRub.toFixed(2), currency: "RUB" },
      confirmation: { type: "redirect", return_url: params.returnUrl },
      capture: true,
      description: params.description,
      metadata: params.metadata,
    }),
  });

  if (!response.ok) {
    throw new Error(`YooKassa createPayment failed: ${response.status} ${await response.text()}`);
  }

  return response.json() as Promise<{
    id: string;
    status: string;
    confirmation: { confirmation_url: string };
  }>;
}

// Webhook-уведомления YooKassa не подписаны - нельзя доверять телу запроса
// напрямую. Правильная проверка - запросить платёж по id у самого YooKassa
// и свериться с его статусом.
export async function getPayment(paymentId: string) {
  const response = await fetch(`${YOOKASSA_API}/payments/${paymentId}`, {
    headers: { Authorization: authHeader() },
  });

  if (!response.ok) {
    throw new Error(`YooKassa getPayment failed: ${response.status} ${await response.text()}`);
  }

  return response.json() as Promise<{
    id: string;
    status: "pending" | "waiting_for_capture" | "succeeded" | "canceled";
    metadata: Record<string, string>;
  }>;
}
