export const TARIFFS = [
  {
    code: "start",
    name: "Старт",
    priceRub: 14900,
    managerLimit: 3,
    features: ["Анализ переписок", "Дашборд собственника", "Ежедневная сводка в Telegram"],
  },
  {
    code: "business",
    name: "Бизнес",
    priceRub: 34900,
    managerLimit: 10,
    features: [
      "Всё из тарифа Старт",
      "Live-подсказки менеджерам в Telegram",
      "Авто-дожим молчащих лидов",
    ],
    highlighted: true,
  },
  {
    code: "enterprise",
    name: "Энтерпрайз",
    priceRub: 69900,
    managerLimit: null,
    features: ["Всё из тарифа Бизнес", "Приоритетная поддержка", "Индивидуальные условия"],
  },
] as const;

export type TariffCode = (typeof TARIFFS)[number]["code"];
