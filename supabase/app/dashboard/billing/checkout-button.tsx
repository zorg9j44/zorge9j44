"use client";

import { useState } from "react";
import type { TariffCode } from "@/lib/tariffs";

export function CheckoutButton({ tariffCode }: { tariffCode: TariffCode }) {
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    setLoading(true);
    try {
      const response = await fetch("/api/billing/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tariffCode }),
      });
      const data = await response.json();
      if (data.confirmationUrl) {
        window.location.href = data.confirmationUrl;
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <button onClick={handleClick} disabled={loading} className="btn-accent mt-8">
      {loading ? "Переход к оплате..." : "Выбрать"}
    </button>
  );
}
