import { config } from "dotenv";
import { resolve } from "path";

config({ path: resolve(process.cwd(), ".env") });

export type Provider = "anthropic" | "ollama";

export function getProvider(): Provider {
  const explicit = process.env.LLM_PROVIDER?.toLowerCase();
  if (explicit === "anthropic" || explicit === "ollama") return explicit;

  // Auto-detect: prefer Anthropic if key is set, otherwise Ollama
  if (process.env.ANTHROPIC_API_KEY) return "anthropic";
  return "ollama";
}

export function getAnthropicApiKey(): string {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) {
    console.error(
      "Error: ANTHROPIC_API_KEY is not set.\n" +
        "Set it in your environment or create a .env file (see .env.example)."
    );
    process.exit(1);
  }
  return key;
}

export function getOllamaHost(): string {
  return process.env.OLLAMA_HOST ?? "http://127.0.0.1:11434";
}

export function getOllamaModel(): string {
  return process.env.OLLAMA_MODEL ?? "llama3.2";
}
