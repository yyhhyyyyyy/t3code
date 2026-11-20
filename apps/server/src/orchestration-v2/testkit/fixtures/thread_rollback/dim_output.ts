import { assert } from "@effect/vitest";
import type { ProviderReplayTranscript } from "@t3tools/contracts";

import type { OrchestratorV2ScenarioResult } from "../../OrchestratorScenario.ts";
import {
  assertBaseProjection,
  assertRunOrdinals,
  assertSemanticProjectionIntegrity,
  assertTurnItemTypeSequence,
  assertUserMessagesInclude,
  assertVisibleTurnItemTypeSequence,
  assertVisibleUserMessagesExclude,
  assertVisibleUserMessagesInclude,
  projectionFor,
  THREAD_ROLLBACK_AFTER_PROMPT,
  THREAD_ROLLBACK_FIRST_PROMPT,
  THREAD_ROLLBACK_SECOND_PROMPT,
} from "../shared.ts";

type Frame = Record<string, unknown>;

const outboundMethods = (transcript: ProviderReplayTranscript): ReadonlyArray<string> =>
  transcript.entries.flatMap((entry) =>
    entry.type === "expect_outbound" &&
    typeof entry.frame === "object" &&
    entry.frame !== null &&
    typeof Reflect.get(entry.frame, "method") === "string"
      ? [Reflect.get(entry.frame, "method") as string]
      : [],
  );

/** The session id `session.fork` returned, matched to its request by frame id. */
const forkedSessionId = (transcript: ProviderReplayTranscript): string => {
  const requestIndex = transcript.entries.findIndex(
    (entry) =>
      entry.type === "expect_outbound" &&
      typeof entry.frame === "object" &&
      entry.frame !== null &&
      Reflect.get(entry.frame, "method") === "session.fork",
  );
  assert.isAtLeast(requestIndex, 0, "the rollback must fork the Dim session");
  const request = transcript.entries[requestIndex];
  const id = request?.type === "expect_outbound" ? (request.frame as Frame)["id"] : undefined;
  // Frame ids restart with each connection, so the reply must follow its own request.
  const replyIndex = transcript.entries.findIndex(
    (entry, index) =>
      index > requestIndex &&
      entry.type === "emit_inbound" &&
      typeof entry.frame === "object" &&
      entry.frame !== null &&
      Reflect.get(entry.frame, "id") === id,
  );
  assert.isAtLeast(replyIndex, 0, "session.fork must have a recorded reply");
  const reply = transcript.entries[replyIndex];
  const result = reply?.type === "emit_inbound" ? (reply.frame as Frame)["result"] : undefined;
  const sessionId =
    typeof result === "object" && result !== null ? (result as Frame)["sessionId"] : undefined;
  assert.isString(sessionId, "session.fork must return the forked session id");
  return sessionId as string;
};

export function assertDimThreadRollbackOutput(
  result: OrchestratorV2ScenarioResult,
  transcript: ProviderReplayTranscript,
) {
  assertBaseProjection({
    result,
    transcript,
    runCount: 3,
    runStatuses: ["completed", "rolled_back", "completed"],
  });

  const projection = projectionFor(result, transcript.scenario);
  assertSemanticProjectionIntegrity(projection);
  assertRunOrdinals(projection, [1, 2, 3]);
  assertTurnItemTypeSequence(projection, [
    "user_message",
    "assistant_message",
    "checkpoint",
    "user_message",
    "assistant_message",
    "checkpoint",
    "user_message",
    "assistant_message",
    "checkpoint",
  ]);
  assertVisibleTurnItemTypeSequence(projection, [
    "user_message",
    "assistant_message",
    "checkpoint",
    "user_message",
    "assistant_message",
    "checkpoint",
  ]);
  assertUserMessagesInclude(projection, [
    THREAD_ROLLBACK_FIRST_PROMPT,
    THREAD_ROLLBACK_SECOND_PROMPT,
    THREAD_ROLLBACK_AFTER_PROMPT,
  ]);
  assertVisibleUserMessagesInclude(projection, [
    THREAD_ROLLBACK_FIRST_PROMPT,
    THREAD_ROLLBACK_AFTER_PROMPT,
  ]);
  assertVisibleUserMessagesExclude(projection, [THREAD_ROLLBACK_SECOND_PROMPT]);
  assert.isAtLeast(projection.checkpoints.length, 2);
  assert.isTrue(
    projection.runs.some((run) => run.status === "rolled_back"),
    "rollback must be visible in run state",
  );

  // Dim truncates by forking at the target turn and moving the thread to the fork.
  const forkSessionId = forkedSessionId(transcript);
  const methods = outboundMethods(transcript);
  const forkIndex = methods.indexOf("session.fork");
  const submitsAfterFork = transcript.entries.filter(
    (entry) =>
      entry.type === "expect_outbound" &&
      typeof entry.frame === "object" &&
      entry.frame !== null &&
      Reflect.get(entry.frame, "method") === "session.submit" &&
      typeof Reflect.get(entry.frame, "params") === "object" &&
      Reflect.get(Reflect.get(entry.frame, "params") as Frame, "sessionId") === forkSessionId,
  );
  assert.isAtLeast(
    submitsAfterFork.length,
    1,
    "the turn after the rollback must run on the forked Dim session",
  );
  assert.isAbove(methods.lastIndexOf("session.submit"), forkIndex);
  assert.strictEqual(
    projection.providerThreads[0]?.nativeThreadRef?.nativeId,
    forkSessionId,
    "the provider thread must move to the fork",
  );
  assert.lengthOf(projection.providerThreads, 1, "a rollback must not add a provider thread");

  // The forked context only holds turns up to the cut: the recorded model echoed the prompts it saw.
  const recall = projection.turnItems.findLast((item) => item.type === "assistant_message");
  const recallText = recall?.type === "assistant_message" ? recall.text : "";
  assert.include(recallText, THREAD_ROLLBACK_FIRST_PROMPT);
  assert.notInclude(recallText, THREAD_ROLLBACK_SECOND_PROMPT);
}
