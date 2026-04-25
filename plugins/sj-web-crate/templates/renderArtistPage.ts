import { featureResolver } from "../../../src/crateFeatureResolver.ts";

export function renderArtistPage(
  data: Record<string, unknown>,
  base: string,
): string {
  const name = data.artistNameLabel as string;
  const mixLinks = (data.mixLinks ?? []) as { label: string; link: string }[];
  const features = (data.features ?? []) as string[];

  const matchedFeature = features.find((f) => f in featureResolver);
  const attachment = matchedFeature
    ? featureResolver[matchedFeature as keyof typeof featureResolver]()
    : ((data.attachment as string | null) ?? null);

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>${name}</title>
  <link rel="stylesheet" href="/src/styles/style.css"/>
  <link rel="stylesheet" href="/src/styles/artist-details.css"/>
  <script src="/src/scripts/common.ts" type="module"></script>
</head>
<body>
<header></header>
<nav><a href="${base}">← Back</a></nav>
<main>
  <h1>${name}</h1>
  ${
    mixLinks.length
      ? `<ul id="mix-links">
    ${mixLinks.map((mix) => `<li><a href="${mix.link}" target="_blank" rel="noopener">${mix.label}</a></li>`).join("\n    ")}
  </ul>`
      : ""
  }
  ${attachment ? `<p id="attachments">${attachment}</p>` : ""}
</main>
<footer></footer>
</body>
</html>`;
}
