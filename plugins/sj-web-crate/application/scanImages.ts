import { readdirSync } from "fs";
import { resolve } from "path";

export function scanImages(slug: string, publicSubdir: string): string[] {
  const dir = resolve(process.cwd(), "public", publicSubdir);
  const pattern = new RegExp(`^${slug}(\\d+)\\.png$`);
  try {
    return readdirSync(dir)
      .filter((f) => pattern.test(f))
      .sort((a, b) => {
        const an = parseInt(a.match(pattern)![1]);
        const bn = parseInt(b.match(pattern)![1]);
        return an - bn;
      })
      .map((f) => `/${publicSubdir}/${f}`);
  } catch {
    return [];
  }
}