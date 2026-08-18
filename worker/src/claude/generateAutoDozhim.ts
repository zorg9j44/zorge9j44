import { anthropic, ANALYSIS_MODEL } from "./client.js";

const SYSTEM_PROMPT = `Ты помогаешь менеджеру по продажам написать сообщение клиенту, который перестал отвечать.
Пиши от лица менеджера, имитируя его стиль общения (длина фраз, обращения, эмодзи - только если менеджер сам их использовал).
Сообщение должно быть коротким (1-3 предложения), нативным, без давления и без "купите скорее" - цель мягко вернуть клиента в диалог.
Верни только текст сообщения, без кавычек и пояснений.`;

export async function generateAutoDozhimMessage(params: {
  managerStyleSample: string;
  dialogueTranscript: string;
}): Promise<string> {
  const response = await anthropic.messages.create({
    model: ANALYSIS_MODEL,
    max_tokens: 512,
    system: SYSTEM_PROMPT,
    output_config: { effort: "medium" },
    messages: [
      {
        role: "user",
        content: `Примеры сообщений менеджера (для стиля):\n${params.managerStyleSample}\n\nПереписка с клиентом, который замолчал:\n${params.dialogueTranscript}\n\nНапиши сообщение для возврата клиента в диалог.`,
      },
    ],
  });

  const textBlock = response.content.find((block) => block.type === "text");
  if (!textBlock || textBlock.type !== "text") {
    throw new Error("Claude не вернул текст сообщения для авто-дожима");
  }

  return textBlock.text.trim();
}
