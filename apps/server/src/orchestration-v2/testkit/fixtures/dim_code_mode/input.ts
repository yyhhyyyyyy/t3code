import type { OrchestratorFixtureInput } from "../shared.ts";

export const DIM_CODE_MODE_PROMPT =
  "Use Code Mode to read fixture-note.txt and reply exactly: code mode fixture complete";

export function dimCodeModeInput(): OrchestratorFixtureInput {
  return {
    steps: [{ type: "message", text: DIM_CODE_MODE_PROMPT }],
    workspaceFiles: { "fixture-note.txt": "code mode child content\n" },
  };
}
