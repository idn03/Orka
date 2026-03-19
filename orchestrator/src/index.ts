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
import { ROLES, type RoleName } from "./roles.js";
import { invokeAgent } from "./agent.js";

const program = new Command();

program
  .name("orka")
  .description("Spec-driven, multi-agent software delivery system")
  .version("0.1.0");

// ── auth ─────────────────────────────────────────────────────────────

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

// ── agent ────────────────────────────────────────────────────────────

const agent = program.command("agent").description("Agent commands");

agent
  .command("roles")
  .description("List all agent roles and their permissions")
  .action(() => {
    for (const role of Object.values(ROLES)) {
      const perms = Object.entries(role.permissions)
        .filter(([, v]) => v)
        .map(([k]) => k);

      console.log(`\n${role.name}`);
      console.log(`  ${role.description}`);
      console.log(`  Permissions: ${perms.join(", ")}`);
    }
    console.log();
  });

agent
  .command("invoke <role> <message>")
  .description("Invoke an agent with a message (for testing)")
  .option("-s, --spec <path>", "Path to spec file (relative to cwd)")
  .action(async (role: string, message: string, opts: { spec?: string }) => {
    const roleName = role as RoleName;
    if (!ROLES[roleName]) {
      console.error(
        `Unknown role: ${role}. Available: ${Object.keys(ROLES).join(", ")}`
      );
      process.exit(1);
    }

    console.log(`Invoking ${roleName} agent...`);
    if (opts.spec) {
      console.log(`Spec: ${opts.spec}`);
      if (!ROLES[roleName].permissions.canReadSpec) {
        console.log(`(Note: ${roleName} cannot read specs — access will be denied)`);
      }
    }

    try {
      const response = await invokeAgent({
        roleName,
        messages: [{ role: "user", content: message }],
        specPath: opts.spec,
      });

      console.log(`\n── ${response.role} response ──\n`);
      console.log(response.content);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      console.error(`Agent invocation failed: ${message}`);
      process.exit(1);
    }
  });

program.parse();
