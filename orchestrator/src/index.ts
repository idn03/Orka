#!/usr/bin/env node

import { Command } from "commander";
import Anthropic from "@anthropic-ai/sdk";
import { Ollama } from "ollama";
import {
  getProvider,
  getAnthropicApiKey,
  getOllamaHost,
  getOllamaModel,
} from "./env.js";

const program = new Command();

program
  .name("orka")
  .description("Spec-driven, multi-agent software delivery system")
  .version("0.1.0");

const auth = program.command("auth").description("Authentication commands");

auth
  .command("check")
  .description("Verify the LLM provider is reachable")
  .action(async () => {
    const provider = getProvider();
    console.log(`Provider: ${provider}`);

    if (provider === "anthropic") {
      await checkAnthropic();
    } else {
      await checkOllama();
    }
  });

async function checkAnthropic() {
  const apiKey = getAnthropicApiKey();
  const client = new Anthropic({ apiKey });

  console.log("Checking Anthropic API key...");

  try {
    const response = await client.messages.create({
      model: "claude-opus-4-6",
      max_tokens: 16,
      messages: [{ role: "user", content: "Reply with only: ok" }],
    });

    const text =
      response.content[0].type === "text" ? response.content[0].text : "";

    console.log(`Model: ${response.model}`);
    console.log(`Response: ${text.trim()}`);
    console.log("Auth check passed. Anthropic API key is valid.");
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`Auth check failed: ${message}`);
    process.exit(1);
  }
}

async function checkOllama() {
  const host = getOllamaHost();
  const model = getOllamaModel();
  const client = new Ollama({ host });

  console.log(`Connecting to Ollama at ${host}...`);
  console.log(`Model: ${model}`);

  try {
    const response = await client.chat({
      model,
      messages: [{ role: "user", content: "Reply with only: ok" }],
    });

    console.log(`Response: ${response.message.content.trim()}`);
    console.log("Auth check passed. Ollama is ready.");
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`Auth check failed: ${message}`);
    console.error(
      "\nMake sure Ollama is running (ollama serve) and the model is pulled (ollama pull " +
        model +
        ")."
    );
    process.exit(1);
  }
}

program.parse();
