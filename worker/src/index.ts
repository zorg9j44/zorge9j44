import cron from "node-cron";
import "./workers/analysisWorker.js";
import "./workers/autoDozhimWorker.js";
import { startAllManagerSessions } from "./telegram/userSessionManager.js";
import { startBotPolling } from "./telegram/botPolling.js";
import { scanSilentDialogues } from "./cron/scanSilentDialogues.js";
import { sendDailySummaries } from "./cron/sendDailySummaries.js";

async function main() {
  console.log("[worker] запуск Нейро-РОП воркера...");

  await startAllManagerSessions();
  startBotPolling();

  // Раз в час проверяем молчащих лидов
  cron.schedule("0 * * * *", () => {
    scanSilentDialogues().catch((err) => console.error("[cron] scanSilentDialogues:", err));
  });

  // Ежедневная сводка собственнику в 9:00 по МСК (UTC+3 -> 06:00 UTC)
  cron.schedule("0 6 * * *", () => {
    sendDailySummaries().catch((err) => console.error("[cron] sendDailySummaries:", err));
  });

  console.log("[worker] воркер запущен, слушает Telegram и очередь задач");
}

main().catch((err) => {
  console.error("[worker] фатальная ошибка при старте:", err);
  process.exit(1);
});
