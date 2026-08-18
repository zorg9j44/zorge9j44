import { Queue } from "bullmq";
import { redisConnection } from "./connection.js";

export interface AnalyzeDialogueJob {
  dialogueId: string;
}

export interface AutoDozhimJob {
  dialogueId: string;
}

export const analysisQueue = new Queue<AnalyzeDialogueJob>("analysis", {
  connection: redisConnection,
});

export const autoDozhimQueue = new Queue<AutoDozhimJob>("auto-dozhim", {
  connection: redisConnection,
});
