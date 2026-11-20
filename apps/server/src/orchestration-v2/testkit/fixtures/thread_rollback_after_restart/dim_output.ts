import { assert } from "@effect/vitest";
import type { ProviderReplayTranscript } from "@t3tools/contracts";

import type { OrchestratorV2ScenarioResult } from "../../OrchestratorScenario.ts";
import { assertDimThreadRollbackOutput } from "../thread_rollback/dim_output.ts";

/** After the idle release the rollback reopens the thread's native session before forking it. */
export function assertDimThreadRollbackAfterRestartOutput(
  result: OrchestratorV2ScenarioResult,
  transcript: ProviderReplayTranscript,
) {
  assertDimThreadRollbackOutput(result, transcript);
  const hellos = transcript.entries.filter(
    (entry) =>
      entry.type === "expect_outbound" &&
      typeof entry.frame === "object" &&
      entry.frame !== null &&
      Reflect.get(entry.frame, "method") === "hello",
  );
  assert.isAtLeast(hellos.length, 2, "the idle release must open a second Dim connection");
}
