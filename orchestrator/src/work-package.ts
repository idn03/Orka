/**
 * Work package — the unit of work passed from orchestrator to workers.
 * Workers (implementer, tester) only see work packages, never raw specs.
 */

export interface WorkPackage {
  id: string;
  title: string;
  description: string;
  requirements: string[];
  context: string;
  acceptanceCriteria: string[];
  assignedTo: "implementer" | "tester";
}

export function formatWorkPackagePrompt(wp: WorkPackage): string {
  return [
    `# Work Package: ${wp.title}`,
    `ID: ${wp.id}`,
    "",
    "## Description",
    wp.description,
    "",
    "## Requirements",
    ...wp.requirements.map((r, i) => `${i + 1}. ${r}`),
    "",
    "## Context",
    wp.context,
    "",
    "## Acceptance Criteria",
    ...wp.acceptanceCriteria.map((c, i) => `- [ ] ${c}`),
  ].join("\n");
}
