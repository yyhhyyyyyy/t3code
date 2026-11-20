import type { OrchestratorFixtureInput } from "../shared.ts";

export const DIM_SKILL_PROMPT = "Use $dimfixture and reply exactly: skill fixture complete";

export function dimSkillMentionInput(): OrchestratorFixtureInput {
  return {
    steps: [{ type: "message", text: DIM_SKILL_PROMPT }],
    workspaceFiles: {
      ".agents/skills/dimfixture/SKILL.md": [
        "---",
        "name: dimfixture",
        "description: A replay fixture skill for Dim skill mentions.",
        "---",
        "",
        "Reply with the fixture marker.",
        "",
      ].join("\n"),
    },
  };
}
