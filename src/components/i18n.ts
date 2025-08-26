import i18n, { Lang, langs } from "@/i18n";
import { DefEle, UiBase } from "./web-componet-base";
import { html } from "@/utils";

@DefEle('i18n')
export class I18n extends UiBase {
    static get observedAttributes() {
        return [...UiBase.observedAttributes, 'i18n-key'];
    }

    protected _template = html`<slot></slot>`;

    constructor() {
        super();
        this._applyTemplate();
    }

    attributeChangedCallback(_: string, oldValue: string, newValue: string) {
        super.attributeChangedCallback(_, oldValue, newValue);
        if (oldValue === newValue) return;
        this.updateText();
    }

    connectedCallback() {
        this.updateText();
    }

    public updateText() {
        let lang = (this.getAttribute('lang') || 'en-US') as Lang;
        if (!langs.includes(lang)) lang = 'en-US';
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let text: any = i18n[lang];
        const keys = (this.getAttribute('i18n-key') || '').split('.');
        for (const k of keys) {
            text = text?.[k];
            if (!text) break;
        }
        if (text) this.textContent = text;
    }
}
