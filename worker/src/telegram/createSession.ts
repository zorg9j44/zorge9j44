// Разовый CLI-скрипт для подключения личного Telegram-аккаунта менеджера.
// Запуск: tsx src/telegram/createSession.ts
// Логинится под аккаунтом менеджера (телефон + код + пароль 2FA, если есть),
// печатает session-строку - её нужно зашифровать (encryptSessionString) и
// сохранить в telegram_sessions.session_string_encrypted.
import { TelegramClient } from "teleproto";
import { StringSession } from "teleproto/sessions/index.js";
import * as readline from "node:readline/promises";
import { env } from "../env.js";
import { encryptSessionString } from "../crypto.js";

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
const ask = (question: string) => rl.question(question);

async function main() {
  const client = new TelegramClient(
    new StringSession(""),
    env.telegramApiId,
    env.telegramApiHash,
    { connectionRetries: 5 },
  );

  await client.start({
    phoneNumber: async () => await ask("Номер телефона менеджера (+7...): "),
    password: async () => await ask("Пароль 2FA (если включён, иначе Enter): "),
    phoneCode: async () => await ask("Код из Telegram: "),
    onError: (err) => console.error(err),
  });

  const sessionString = client.session.save() as unknown as string;
  const encrypted = encryptSessionString(sessionString);

  console.log("\nСессия создана. Сохраните это значение в telegram_sessions.session_string_encrypted:\n");
  console.log(encrypted);

  await client.disconnect();
  rl.close();
}

main();
