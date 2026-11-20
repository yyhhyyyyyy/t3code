import {
  CustomModelSetting,
  makeBinaryPathSetting,
  makeProviderSettingsSchema,
  TrimmedString,
} from "@t3tools/contracts";
import * as Effect from "effect/Effect";
import * as Schema from "effect/Schema";

export const DimSettings = makeProviderSettingsSchema(
  {
    // The default instance must arrive enabled: clients that predate this driver render its
    // settings read-only, so nobody could turn it on from them.
    enabled: Schema.Boolean.pipe(
      Schema.withDecodingDefault(Effect.succeed(true)),
      Schema.annotateKey({ providerSettingsForm: { hidden: true } }),
    ),
    binaryPath: makeBinaryPathSetting("dima").pipe(
      Schema.annotateKey({
        title: "Binary path",
        description: "Path to the Dim CLI. A login-shell PATH resolves `dima`.",
        providerSettingsForm: { placeholder: "dima", clearWhenEmpty: "omit" },
      }),
    ),
    productHome: TrimmedString.pipe(
      Schema.withDecodingDefault(Effect.succeed("")),
      Schema.annotateKey({
        title: "Dim home",
        description:
          "Your Dim home, shared with the dima CLI. Empty uses DIMCODE_HOME, else ~/.dimcode-alpha.",
        providerSettingsForm: {
          placeholder: "~/.dimcode-alpha",
          clearWhenEmpty: "omit",
        },
      }),
    ),
    socketPath: TrimmedString.pipe(
      Schema.withDecodingDefault(Effect.succeed("")),
      Schema.annotateKey({
        title: "Socket override",
        description:
          "Connect to an already running daemon at this socket. A set override never starts a daemon.",
        providerSettingsForm: { placeholder: "", clearWhenEmpty: "omit" },
      }),
    ),
    modelConfigPath: TrimmedString.pipe(
      Schema.withDecodingDefault(Effect.succeed("")),
      Schema.annotateKey({ providerSettingsForm: { hidden: true } }),
    ),
    customModels: Schema.Array(CustomModelSetting).pipe(
      Schema.withDecodingDefault(Effect.succeed([])),
      Schema.annotateKey({ providerSettingsForm: { hidden: true } }),
    ),
  },
  {
    order: ["binaryPath", "productHome", "socketPath"],
  },
);

export type DimSettings = typeof DimSettings.Type;
