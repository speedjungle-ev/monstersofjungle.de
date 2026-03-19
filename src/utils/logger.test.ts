import { describe, it, expect, vi } from "vitest";
import { logger, loggerWarn } from "./logger";

describe("logger", () => {
  it("prefixes output with [sj-web-crate]", () => {
    const spy = vi.spyOn(console, "log").mockImplementation(() => {});
    logger(true, "scanning:", "/some/path");
    expect(spy).toHaveBeenCalledWith(
      "[sj-web-crate]",
      "scanning:",
      "/some/path",
    );
    spy.mockRestore();
  });

  it("prefixes warn output with [sj-web-crate]", () => {
    const consoleMessage = "No .md files found in src/artists";
    const spy = vi.spyOn(console, "warn").mockImplementation(() => {});
    loggerWarn(true, consoleMessage);
    expect(spy).toHaveBeenCalledWith("[sj-web-crate]", consoleMessage);
    spy.mockRestore();
  });
});
