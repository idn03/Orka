/**
 * Review → Test → Validate pipeline.
 *
 * Runs generated code through three quality gates. On failure at any stage,
 * the pipeline either triggers rework (sends feedback back to implementer)
 * or reports the failure after exhausting retries.
 */

import { invokeAgent, type AgentResponse } from "./agent.js";
import type { WorkPackage } from "./work-package.js";
import { writeFileSync, mkdirSync, existsSync } from "fs";
import { join } from "path";

// ── Types ────────────────────────────────────────────────────────────

export type StageVerdict = "pass" | "fail";

export interface StageResult {
  stage: "review" | "test" | "validate";
  verdict: StageVerdict;
  feedback: string;
  raw: AgentResponse;
}

export interface PipelineResult {
  status: "accepted" | "rework" | "failed";
  stages: StageResult[];
  /** The final code after all rework attempts */
  finalCode: string;
  /** Total rework iterations executed */
  iterations: number;
}

export interface PipelineOptions {
  workPackage: WorkPackage;
  code: string;
  specPath?: string;
  maxRetries?: number;
  stateDir?: string;
}

// ── Verdict parsing ──────────────────────────────────────────────────

/**
 * Parse an agent response to extract a pass/fail verdict.
 * Looks for VERDICT: PASS or VERDICT: FAIL in the response.
 * Defaults to "fail" if no clear verdict is found.
 */
function parseVerdict(content: string): StageVerdict {
  const upper = content.toUpperCase();
  // Look for explicit verdict markers first
  if (/VERDICT:\s*PASS/.test(upper)) return "pass";
  if (/VERDICT:\s*FAIL/.test(upper)) return "fail";
  // Fallback heuristics
  if (/\bAPPROVED\b/.test(upper) && !/\bNOT\s+APPROVED\b/.test(upper))
    return "pass";
  if (/\bALL\s+(TESTS?\s+)?PASS(ED)?\b/.test(upper)) return "pass";
  // Default to fail if unclear — safer to require explicit approval
  return "fail";
}

// ── Stage runners ────────────────────────────────────────────────────

async function runReview(
  code: string,
  specPath?: string
): Promise<StageResult> {
  const response = await invokeAgent({
    roleName: "reviewer",
    specPath,
    messages: [
      {
        role: "user",
        content: `Review the following code for correctness, quality, and alignment with the specification.

Respond with:
- A list of issues found (if any)
- For each issue: severity (blocking / suggestion) and what to fix
- End with exactly "VERDICT: PASS" or "VERDICT: FAIL"

## Code to review

\`\`\`
${code}
\`\`\``,
      },
    ],
  });

  return {
    stage: "review",
    verdict: parseVerdict(response.content),
    feedback: response.content,
    raw: response,
  };
}

async function runTest(
  code: string,
  workPackage: WorkPackage
): Promise<StageResult> {
  const response = await invokeAgent({
    roleName: "tester",
    workPackage,
    messages: [
      {
        role: "user",
        content: `Analyze the following code against the work package requirements.
Write test cases and evaluate whether the code would pass them.

Respond with:
- List of test cases (pass/fail for each)
- Summary of failures (if any)
- End with exactly "VERDICT: PASS" or "VERDICT: FAIL"

## Code to test

\`\`\`
${code}
\`\`\``,
      },
    ],
  });

  return {
    stage: "test",
    verdict: parseVerdict(response.content),
    feedback: response.content,
    raw: response,
  };
}

async function runValidate(
  code: string,
  specPath?: string
): Promise<StageResult> {
  const response = await invokeAgent({
    roleName: "validator",
    specPath,
    messages: [
      {
        role: "user",
        content: `Validate the following code against the specification and acceptance criteria.

For each acceptance criterion, indicate PASS or FAIL with a brief reason.

Respond with:
- A validation report (table or list)
- End with exactly "VERDICT: PASS" or "VERDICT: FAIL"

## Code to validate

\`\`\`
${code}
\`\`\``,
      },
    ],
  });

  return {
    stage: "validate",
    verdict: parseVerdict(response.content),
    feedback: response.content,
    raw: response,
  };
}

// ── Rework ───────────────────────────────────────────────────────────

async function requestRework(
  code: string,
  failures: StageResult[],
  workPackage: WorkPackage
): Promise<string> {
  const feedbackSummary = failures
    .map((f) => `### ${f.stage.toUpperCase()} feedback\n\n${f.feedback}`)
    .join("\n\n---\n\n");

  const response = await invokeAgent({
    roleName: "implementer",
    workPackage,
    messages: [
      {
        role: "user",
        content: `The following code was reviewed and did NOT pass quality gates.
Fix the issues described in the feedback below and return the corrected code.

## Current code

\`\`\`
${code}
\`\`\`

## Feedback from review stages

${feedbackSummary}

Respond with the full corrected code only (no explanations). Wrap it in a single code block.`,
      },
    ],
  });

  // Extract code from response (look for code block)
  const codeMatch = response.content.match(/```[\s\S]*?\n([\s\S]*?)```/);
  return codeMatch ? codeMatch[1].trim() : response.content;
}

// ── State persistence ────────────────────────────────────────────────

function saveState(
  stateDir: string,
  wpId: string,
  iteration: number,
  result: StageResult
) {
  const dir = join(stateDir, wpId);
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }

  const filename = `${iteration}-${result.stage}.json`;
  writeFileSync(
    join(dir, filename),
    JSON.stringify(
      {
        stage: result.stage,
        verdict: result.verdict,
        feedback: result.feedback,
        timestamp: new Date().toISOString(),
      },
      null,
      2
    )
  );
}

// ── Pipeline ─────────────────────────────────────────────────────────

export async function runPipeline(
  options: PipelineOptions
): Promise<PipelineResult> {
  const {
    workPackage,
    specPath,
    maxRetries = 2,
    stateDir = join(process.cwd(), ".state"),
  } = options;

  let code = options.code;
  let iteration = 0;
  const allStages: StageResult[] = [];

  while (iteration <= maxRetries) {
    const iterationLabel =
      iteration === 0 ? "Initial" : `Rework #${iteration}`;
    console.log(`\n── ${iterationLabel} pipeline run ──\n`);

    // Stage 1: Review
    console.log("[1/3] Review...");
    const reviewResult = await runReview(code, specPath);
    allStages.push(reviewResult);
    saveState(stateDir, workPackage.id, iteration, reviewResult);
    console.log(`      Verdict: ${reviewResult.verdict.toUpperCase()}`);

    if (reviewResult.verdict === "fail") {
      if (iteration < maxRetries) {
        console.log("      Triggering rework...");
        code = await requestRework(code, [reviewResult], workPackage);
        iteration++;
        continue;
      }
      return {
        status: "failed",
        stages: allStages,
        finalCode: code,
        iterations: iteration,
      };
    }

    // Stage 2: Test
    console.log("[2/3] Test...");
    const testResult = await runTest(code, workPackage);
    allStages.push(testResult);
    saveState(stateDir, workPackage.id, iteration, testResult);
    console.log(`      Verdict: ${testResult.verdict.toUpperCase()}`);

    if (testResult.verdict === "fail") {
      if (iteration < maxRetries) {
        console.log("      Triggering rework...");
        code = await requestRework(code, [testResult], workPackage);
        iteration++;
        continue;
      }
      return {
        status: "failed",
        stages: allStages,
        finalCode: code,
        iterations: iteration,
      };
    }

    // Stage 3: Validate
    console.log("[3/3] Validate...");
    const validateResult = await runValidate(code, specPath);
    allStages.push(validateResult);
    saveState(stateDir, workPackage.id, iteration, validateResult);
    console.log(`      Verdict: ${validateResult.verdict.toUpperCase()}`);

    if (validateResult.verdict === "fail") {
      if (iteration < maxRetries) {
        console.log("      Triggering rework...");
        code = await requestRework(
          code,
          [validateResult],
          workPackage
        );
        iteration++;
        continue;
      }
      return {
        status: "failed",
        stages: allStages,
        finalCode: code,
        iterations: iteration,
      };
    }

    // All stages passed
    return {
      status: "accepted",
      stages: allStages,
      finalCode: code,
      iterations: iteration,
    };
  }

  // Should not reach here, but just in case
  return {
    status: "failed",
    stages: allStages,
    finalCode: code,
    iterations: iteration,
  };
}
