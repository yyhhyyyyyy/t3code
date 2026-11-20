import { assert, describe, it } from "@effect/vitest";

import { dimSkillMentionText, hasDimSkillMention } from "./prompts.ts";

const catalog = new Set(["review", "commit", "deploy"]);

describe("dimSkillMentionText", () => {
  it("rewrites a mention of a Skill the session lists", () => {
    assert.strictEqual(dimSkillMentionText("$review", catalog), "/skill:review");
    assert.strictEqual(
      dimSkillMentionText("please $commit these changes", catalog),
      "please /skill:commit these changes",
    );
    assert.strictEqual(
      dimSkillMentionText("first €deploy\nsecond ¥deploy", catalog),
      "first /skill:deploy\nsecond /skill:deploy",
    );
  });

  it("leaves an unknown mention, such as an environment variable, alone", () => {
    assert.strictEqual(
      dimSkillMentionText("echo $HOME and $PATH", catalog),
      "echo $HOME and $PATH",
    );
    assert.strictEqual(dimSkillMentionText("$review", new Set()), "$review");
  });

  it("keeps a hand-typed Dim token", () => {
    assert.strictEqual(dimSkillMentionText("/skill:review it", catalog), "/skill:review it");
  });

  it("leaves mentions Dim cannot name alone", () => {
    // A Dim token name holds no `:`, so an ACP-style mention stays the operator's prose.
    assert.strictEqual(
      dimSkillMentionText("$plugin:review", new Set(["plugin:review"])),
      "$plugin:review",
    );
    assert.strictEqual(dimSkillMentionText("a$review", catalog), "a$review");
    assert.strictEqual(dimSkillMentionText("$10 budget", catalog), "$10 budget");
  });
});

describe("hasDimSkillMention", () => {
  it("finds a mention consistently across calls", () => {
    assert.isTrue(hasDimSkillMention("use $review here"));
    assert.isTrue(hasDimSkillMention("use $home here"));
    assert.isTrue(hasDimSkillMention("use $review here"));
    assert.isFalse(hasDimSkillMention("no mentions here"));
    assert.isFalse(hasDimSkillMention("/skill:review it"));
  });
});
