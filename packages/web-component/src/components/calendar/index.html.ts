import { html } from '../../utils';
import { Ele as I18nEle } from '../i18n';
I18nEle.define();
import { weekKey } from './weeks';

export default html`
<div class="wrapper">${
    weekKey
        .map(
            (key) =>
                html`<dt-i18n class="week" i18n-key="date.${key}" part="week"></dt-i18n>`
        )
        .join('') +
    [...Array(7 * 6)]
        .map(
            (_, i) =>
                html`<div class="item" part="item"><i class="bg"></i><i class="highlight"></i><span>${(i % 31) + 1}</span></div>`
        )
        .join('')
}</div>`;
