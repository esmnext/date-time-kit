import i18n, { langs } from "../../i18n";
import { BaseAttrs, UiBase } from "../web-component-base";
import { css, html } from "../../utils";

export interface Attrs extends BaseAttrs {
    'i18n-key'?: string;
}

export class Ele extends UiBase<Attrs> {
    public static readonly tagName = 'dt-i18n' as const;
    protected static _style = css`:host{display:contents}`;
    protected static _template = html`<slot></slot>`;

    static get observedAttributes(): string[] {
        return [
            ...(super.observedAttributes as (keyof BaseAttrs)[]),
            'i18n-key'
        ] satisfies (keyof Attrs)[];
    }

    attributeChangedCallback(name: string, oldValue: string, newValue: string) {
        super.attributeChangedCallback(name, oldValue, newValue);
        if (oldValue === newValue) return;
        if (name === 'lang' || name === 'i18n-key')
            this.updateText();
    }

    connectedCallback() {
        if (!super.connectedCallback()) return;
        this.updateText();
    }

    public updateText() {
        let lang = this._getAttr('lang', 'en-US');
        if (!langs.includes(lang)) lang = 'en-US';
        let text: any = i18n[lang];
        const keys = (this._getAttr('i18n-key') || '').split('.');
        for (const k of keys) {
            text = text?.[k];
            if (!text) break;
        }
        if (text) this.textContent = text;
    }
}

Ele.define();
