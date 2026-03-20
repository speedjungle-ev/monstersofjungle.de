import { html, render } from "lit-html";
import type { MixListLink } from "../types/types";
import speakerUrl from "../assets/speaker.svg";

export function renderMixList(
  mixes: MixListLink[],
  targetElement: HTMLElement,
) {
  render(
    html`${mixes.map(
      (mix) => html`
        <li>
          <img src="${speakerUrl}" alt="Link ${mix.label}" />
          <a href=${mix.link} target="_blank" rel="noopener">${mix.label}</a>
        </li>
      `,
    )}`,
    targetElement,
  );
}
