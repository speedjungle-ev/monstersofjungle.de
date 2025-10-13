import {html, render} from "lit-html";

interface MixListLink {
    label: string
    link: string
}

export function renderMixList(target: HTMLElement, mixes: MixListLink[]) {
    render(html`
        <ul>
            ${mixes.map(
                    (mix) => html`
                        <li>
                            <a href=${mix.link} target="_blank" rel="noopener">${mix.label}</a>
                        </li>
                    `
            )}
        </ul>
    `, target);
}