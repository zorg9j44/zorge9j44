import { z } from "zod";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { anthropic, ANALYSIS_MODEL } from "./client.js";

const FUNNEL_STAGES = [
  "new",
  "qualified",
  "proposal",
  "negotiation",
  "closed_won",
  "closed_lost",
] as const;

export const DialogueAnalysisSchema = z.object({
  funnel_stage: z.enum(FUNNEL_STAGES),
  script_followed: z.boolean(),
  errors: z.array(z.string()).describe("Конкретные ошибки менеджера с цитатами из переписки"),
  close_probability: z.number().describe("Вероятность закрытия сделки, число от 0 до 1"),
  summary: z.string().describe("Краткое резюме диалога на русском, 1-2 предложения"),
  hint_for_manager: z
    .string()
    .nullable()
    .describe("Конкретная подсказка менеджеру прямо сейчас, или null если подсказка не нужна"),
});

export type DialogueAnalysis = z.infer<typeof DialogueAnalysisSchema>;

export interface DialogueMessage {
  senderType: "manager" | "client";
  text: string;
}

const SYSTEM_PROMPT = `Ты — опытный руководитель отдела продаж (РОП) в сфере инфобизнеса/онлайн-образования в России.
Анализируешь переписку менеджера по продажам с клиентом в Telegram.
Оцени: на каком этапе воронки сделка, соблюдён ли типичный скрипт продаж (выявление потребности, презентация, отработка возражений, призыв к действию), какие конкретные ошибки допустил менеджер, вероятность закрытия сделки.
Если менеджеру прямо сейчас нужна подсказка (клиент задал вопрос без ответа, есть возражение без отработки, пора отправить КП, сделка зависла) — дай короткую конкретную подсказку. Если всё идёт штатно, hint_for_manager = null.
Пиши на русском.`;

export async function analyzeDialogue(messages: DialogueMessage[]): Promise<DialogueAnalysis> {
  const transcript = messages
    .map((m) => `${m.senderType === "manager" ? "Менеджер" : "Клиент"}: ${m.text}`)
    .join("\n");

  const response = await anthropic.messages.parse({
    model: ANALYSIS_MODEL,
    max_tokens: 4096,
    system: SYSTEM_PROMPT,
    output_config: {
      effort: "medium",
      format: zodOutputFormat(DialogueAnalysisSchema),
    },
    messages: [{ role: "user", content: transcript }],
  });

  if (!response.parsed_output) {
    throw new Error("Claude не вернул структурированный анализ диалога");
  }

  return response.parsed_output;
}
