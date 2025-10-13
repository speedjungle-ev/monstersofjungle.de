import { html, render } from "lit-html";

export interface MixListLink {
  label: string;
  link: string;
}

export function renderMixList(
  mixes: MixListLink[],
  targetElement: HTMLElement,
) {
  render(
    html`
      <ul>
        ${mixes.map(
          (mix) => `
          <li>
            <a href=${mix.link} target="_blank" rel="noopener">${mix.label}</a>
          </li>
        `,
        )}
      </ul>
    `,
    targetElement,
  );
}
