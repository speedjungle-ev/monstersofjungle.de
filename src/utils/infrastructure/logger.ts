export function logger(verbose: boolean, ...args: unknown[]) {
  if (!verbose) return;
  console.log("[sj-web-crate]", ...args);
}

export function loggerWarn(verbose: boolean, ...args: unknown[]) {
  if (!verbose) return;
  console.warn("[sj-web-crate]", ...args);
}
