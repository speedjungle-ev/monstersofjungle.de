export function logger(...args: unknown[]) {
  console.log("[sj-web-crate]", ...args);
}

export function loggerWarn(...args: unknown[]) {
  console.warn("[sj-web-crate]", ...args);
}
