import { SKILL_MENTION_PATTERN } from "@t3tools/shared/composerInlineTokens";

/** A Dim token name holds `A-Za-z0-9_-`, which excludes the `:` a T3 mention may carry. */
const DIM_SKILL_NAME = /^[A-Za-z0-9_-]+$/u;
const SKILL_MENTION_TEST = new RegExp(SKILL_MENTION_PATTERN.source, "u");

/**
 * Rewrites T3's `$name` skill mention as Dim's `/skill:name` token, which loads the Skill with
 * the input. Only a name the session's own catalog lists as user-invocable is a reference:
 * `$HOME` and an unknown name stay the operator's prose, and a hand-typed `/skill:name` needs
 * no rewrite.
 */
export function dimSkillMentionText(text: string, userInvocable: ReadonlySet<string>): string {
  return text.replace(SKILL_MENTION_PATTERN, (match, prefix: string, name: string) =>
    DIM_SKILL_NAME.test(name) && userInvocable.has(name) ? `${prefix}/skill:${name}` : match,
  );
}

/** Whether `text` carries a mention worth reading the session's catalog for. */
export function hasDimSkillMention(text: string): boolean {
  return SKILL_MENTION_TEST.test(text);
}
