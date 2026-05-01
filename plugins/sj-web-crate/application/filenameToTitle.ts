export function filenameToTitle(stem: string, siteName: string): string {
  if (stem === "index") return siteName;
  const words = stem
    .replace(/([A-Z])/g, " $1")
    .trim()
    .split(/\s+/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1));
  return `${words.join(" ")} | ${siteName}`;
}
