import Anthropic from "@anthropic-ai/sdk";
import { env } from "../env.js";

export const anthropic = new Anthropic({ apiKey: env.anthropicApiKey });

// Sonnet-tier - анализ диалогов идёт в фоне и в объёме (десятки сообщений на
// каждую компанию ежедневно), Opus тут excessive по цене. Sonnet 5 - текущая
// модель этого класса, дешевле и качественнее предыдущей Sonnet 4.6.
export const ANALYSIS_MODEL = "claude-sonnet-5";
