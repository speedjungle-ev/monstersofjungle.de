import { describe, it, expect } from "vitest";
import { filePathToKey } from "./file-path-to-key";

describe("filePathToKey", () => {
  const cases: Array<[string, string]> = [
    ["artists/elektrikearliner.ts", "elektrikearliner"],
    ["relative\\windows\\path\\mjungle.ts", "mjungle"],
    ["NEONIRIS.TS", "NEONIRIS"],
    ["niqawa", "niqawa"], //path with no extension
    ["folder/pukka.js", "pukka.js"],
    ["folder.name/with.dots/ruby.riot.ts", "ruby.riot"],
    ["/absolute/path/to/tforce.ts", "tforce"],
    ["", ""],
  ];

  cases.forEach(([input, expected]) => {
    it(`converts \`${input}\` -> \`${expected}\``, () => {
      expect(filePathToKey(input)).toBe(expected);
    });
  });
});
