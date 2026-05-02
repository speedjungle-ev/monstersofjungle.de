import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { mkdirSync, writeFileSync, rmSync } from "node:fs";
import { join } from "path";
import { parseCrate } from "../domain/parseCrate";

const TMP_DIR = join(__dirname, "__tmp_artist_data__");

function writeFixture(filename: string, content: string) {
  writeFileSync(join(TMP_DIR, filename), content, "utf-8");
}

function md(frontmatter: string, body = "") {
  return `---\n${frontmatter}\n---\n${body}`;
}

beforeEach(() => {
  mkdirSync(TMP_DIR, { recursive: true });
});

afterEach(() => {
  rmSync(TMP_DIR, { recursive: true, force: true });
});

describe(parseCrate, () => {
  describe("file discovery", () => {
    it("returns an empty array and warns when no .md files exist", () => {
      const result = parseCrate({ name: "artist", dir: TMP_DIR }, "/");
      expect(result).toEqual([]);
    });

    it("ignores non-.md files", () => {
      writeFixture("elektrikearliner.ts", "export default {}");
      writeFixture(
        "elektrikearliner.md",
        md("artistNameLabel: elektrik earliner\ngridOrder: 1\nmixLinks: []"),
      );

      const result = parseCrate({ name: "artist", dir: TMP_DIR }, "/");
      expect(result).toHaveLength(1);
      expect(result[0].slug).toBe("elektrikearliner");
    });

    it("throws when the directory does not exist", () => {
      const nonExistingDirectory = "/does/not/exist";
      expect(() =>
        parseCrate(
          { name: "artist", dir: nonExistingDirectory },
          "/",
          false,
        ),
      ).toThrow(`Directory not found: ${nonExistingDirectory}`);
    });
  });

  describe("slug derivation", () => {
    it("derives slug from filename by stripping .md extension", () => {
      writeFixture(
        "elektrikearliner.md",
        md("artistNameLabel: elektrik earliner\ngridOrder: 1\nmixLinks: []"),
      );

      const result = parseCrate({ name: "artist", dir: TMP_DIR }, "/");
      expect(result[0].slug).toBe("elektrikearliner");
    });

    it("handles .md extension", () => {
      writeFixture(
        "tforce.md",
        md("artistNameLabel: T-Force\ngridOrder: 2\nmixLinks: []"),
      );

      const result = parseCrate({ name: "artist", dir: TMP_DIR }, "/");
      expect(result[0].slug).toBe("tforce");
    });
  });

  describe("frontmatter parsing", () => {
    it("parses frontmatter fields into data object", () => {
      writeFixture(
        "elektrikearliner.md",
        md("artistNameLabel: elektrik earliner\ngridOrder: 1\nmixLinks: []"),
      );

      const result = parseCrate({ name: "artist", dir: TMP_DIR }, "/");
      expect(result[0].data).toMatchObject({
        artistNameLabel: "elektrik earliner",
        gridOrder: 1,
        mixLinks: [],
      });
    });

    it("parses mixLinks array correctly", () => {
      writeFixture(
        "pukka.md",
        md(
          `artistNameLabel: DJ Pukka\ngridOrder: 3\nmixLinks:\n  - label: monsters of jungle\n    link: https://mixcloud.com/pukka`,
        ),
      );

      const result = parseCrate({ name: "artist", dir: TMP_DIR }, "/");
      expect(result[0].data.mixLinks).toEqual([
        { label: "monsters of jungle", link: "https://mixcloud.com/pukka" },
      ]);
    });

    it("parses features array correctly", () => {
      writeFixture(
        "elektrikearliner.md",
        md(
          "artistNameLabel: elektrik earliner\ngridOrder: 1\nfeatures:\n  - radioShow\nmixLinks: []",
        ),
      );

      const result = parseCrate({ name: "artist", dir: TMP_DIR }, "/");
      expect(result[0].data.features).toEqual(["radioShow"]);
    });

    it("extracts body content below the frontmatter", () => {
      writeFixture(
        "elektrikearliner.md",
        md(
          "artistNameLabel: elektrik earliner\ngridOrder: 1\nmixLinks: []",
          "Some bio text here.",
        ),
      );

      const result = parseCrate({ name: "artist", dir: TMP_DIR }, "/");
      expect(result[0].body).toBe("Some bio text here.");
    });

    it("returns empty string for body when there is none", () => {
      writeFixture(
        "neoniris.md",
        md("artistNameLabel: Neoniris\ngridOrder: 4\nmixLinks: []"),
      );

      const result = parseCrate({ name: "artist", dir: TMP_DIR }, "/");
      expect(result[0].body).toBe("");
    });
  });

  describe("required fields validation", () => {
    it("throws when a required field is missing", () => {
      writeFixture(
        "neoniris.md",
        md("artistNameLabel: Neoniris\nmixLinks: []"),
      );

      expect(() =>
        parseCrate(
          {
            name: "artist",
            dir: TMP_DIR,
            requiredFields: ["artistNameLabel", "gridOrder"],
          },
          "/",
        ),
      ).toThrow("missing required fields: gridOrder");
    });

    it("throws listing all missing fields at once", () => {
      writeFixture("neoniris.md", md("mixLinks: []"));

      expect(() =>
        parseCrate(
          {
            name: "artist",
            dir: TMP_DIR,
            requiredFields: ["artistNameLabel", "gridOrder"],
          },
          "/",
        ),
      ).toThrow("missing required fields: artistNameLabel, gridOrder");
    });

    it("does not throw when all required fields are present", () => {
      writeFixture(
        "neoniris.md",
        md("artistNameLabel: Neoniris\ngridOrder: 4\nmixLinks: []"),
      );

      expect(() =>
        parseCrate(
          {
            name: "artist",
            dir: TMP_DIR,
            requiredFields: ["artistNameLabel", "gridOrder"],
          },
          "/",
        ),
      ).not.toThrow();
    });

    it("does not throw when requiredFields is not specified", () => {
      writeFixture("neoniris.md", md("mixLinks: []"));

      expect(() =>
        parseCrate({ name: "artist", dir: TMP_DIR }, "/"),
      ).not.toThrow();
    });
  });

  describe("multiple files", () => {
    it("parses all .md files in the directory", () => {
      writeFixture(
        "elektrikearliner.md",
        md("artistNameLabel: elektrik earliner\ngridOrder: 1\nmixLinks: []"),
      );
      writeFixture(
        "tforce.md",
        md("artistNameLabel: T-Force\ngridOrder: 2\nmixLinks: []"),
      );
      writeFixture(
        "pukka.md",
        md("artistNameLabel: DJ Pukka\ngridOrder: 3\nmixLinks: []"),
      );

      const result = parseCrate({ name: "artist", dir: TMP_DIR }, "/");
      expect(result).toHaveLength(3);
      expect(result.map((e) => e.slug)).toContain("elektrikearliner");
      expect(result.map((e) => e.slug)).toContain("tforce");
      expect(result.map((e) => e.slug)).toContain("pukka");
    });
  });
});