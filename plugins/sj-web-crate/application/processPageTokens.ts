import { readFileSync } from "fs";
import { resolve } from "path";

function processScalars(
  template: string,
  data: Record<string, unknown>,
): string {
  return template.replace(/\{\{(\w+)}}/g, (_, key) => String(data[key] ?? ""));
}

export function processPageTokens(
  template: string,
  data: Record<string, unknown>,
  partialsDir: string,
): string {
  const result = template.replace(
    /\{\{#(\w+)}}([\s\S]*?)\{\{\/\1}}/g,
    (_, key, inner) => {
      const value = data[key];
      if (Array.isArray(value)) {
        if (value.length === 0) return "";
        return inner.replace(
          /\{\{>\s*([\w-]+)}}/g,
          (__: unknown, partialName: string) => {
            const partialTemplate = readFileSync(
              resolve(partialsDir, `${partialName}.html`),
              "utf-8",
            );
            return (value as Record<string, unknown>[])
              .map((item) => processScalars(partialTemplate, item))
              .join("\n");
          },
        );
      }
      if (!value) return "";
      return processScalars(inner, data);
    },
  );
  return processScalars(result, data);
}
