/**
 * Agent invocation — sends messages to LLM with role-specific system prompts
 * and enforces permission boundaries.
 */

import Anthropic from "@anthropic-ai/sdk";
import { Ollama } from "ollama";
import { getProvider, getAnthropicApiKey, getOllamaHost, getOllamaModel } from "./env.js";
import { ROLES, type RoleName, type RoleDefinition } from "./roles.js";
import { type WorkPackage, formatWorkPackagePrompt } from "./work-package.js";
import { readFileSync, existsSync } from "fs";
import { join } from "path";

export interface AgentMessage {
  role: "user" | "assistant";
  content: string;
}

export interface AgentInvokeOptions {
  roleName: RoleName;
  messages: AgentMessage[];
  /** If provided for spec-restricted roles, will be injected as context */
  specPath?: string;
  /** If provided for workers, the work package replaces spec access */
  workPackage?: WorkPackage;
}

export interface AgentResponse {
  role: RoleName;
  content: string;
}

/**
 * Build the full message list for an agent, enforcing permission boundaries.
 */
function buildMessages(
  role: RoleDefinition,
  options: AgentInvokeOptions
): AgentMessage[] {
  const contextParts: string[] = [];

  // Spec access — only for roles with canReadSpec
  if (options.specPath && role.permissions.canReadSpec) {
    const absPath = join(process.cwd(), options.specPath);
    if (existsSync(absPath)) {
      const specContent = readFileSync(absPath, "utf-8");
      contextParts.push(`## Core Specification\n\n${specContent}`);
    }
  } else if (options.specPath && !role.permissions.canReadSpec) {
    // Blocked — this is the key permission boundary
    contextParts.push(
      "[Spec access denied. You operate from work packages only.]"
    );
  }

  // Work package — for workers
  if (options.workPackage) {
    contextParts.push(formatWorkPackagePrompt(options.workPackage));
  }

  const contextMessage =
    contextParts.length > 0
      ? [{ role: "user" as const, content: contextParts.join("\n\n---\n\n") }]
      : [];

  return [...contextMessage, ...options.messages];
}

/**
 * Invoke an agent with the given role and messages.
 * Enforces permission boundaries and dispatches to the configured LLM provider.
 */
export async function invokeAgent(
  options: AgentInvokeOptions
): Promise<AgentResponse> {
  const role = ROLES[options.roleName];
  if (!role) {
    throw new Error(`Unknown role: ${options.roleName}`);
  }

  const messages = buildMessages(role, options);
  const provider = getProvider();

  if (provider === "anthropic") {
    return invokeAnthropic(role, messages);
  } else {
    return invokeOllama(role, messages);
  }
}

async function invokeAnthropic(
  role: RoleDefinition,
  messages: AgentMessage[]
): Promise<AgentResponse> {
  const client = new Anthropic({ apiKey: getAnthropicApiKey() });

  const response = await client.messages.create({
    model: "claude-opus-4-6",
    max_tokens: 4096,
    system: role.systemPrompt,
    messages: messages.map((m) => ({ role: m.role, content: m.content })),
  });

  const text =
    response.content[0].type === "text" ? response.content[0].text : "";

  return { role: role.name, content: text };
}

async function invokeOllama(
  role: RoleDefinition,
  messages: AgentMessage[]
): Promise<AgentResponse> {
  const client = new Ollama({ host: getOllamaHost() });
  const model = getOllamaModel();

  const response = await client.chat({
    model,
    messages: [
      { role: "system", content: role.systemPrompt },
      ...messages.map((m) => ({ role: m.role, content: m.content })),
    ],
  });

  return { role: role.name, content: response.message.content };
}
