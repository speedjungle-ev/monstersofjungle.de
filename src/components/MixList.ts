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
    html`${mixes.map(
      (mix) => html`
        <li>
          <img src="/images/speaker.svg" alt="Link ${mix.label}" />
          <a href=${mix.link} target="_blank" rel="noopener">${mix.label}</a>
        </li>
      `,
    )}`,
    targetElement,
  );
}
