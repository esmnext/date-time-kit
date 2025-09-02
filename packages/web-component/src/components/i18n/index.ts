import i18n, { langs } from "../../i18n";
import { BaseAttrs, UiBase } from "../web-component-base";
import { html } from "../../utils";

export interface I18nAttrs extends BaseAttrs {
    'i18n-key'?: string;
}

export default class I18n extends UiBase<I18nAttrs> {
    protected static tagName = 'dt-i18n';

    static get observedAttributes(): string[] {
        return [
            ...(super.observedAttributes as (keyof BaseAttrs)[]),
            'i18n-key'
        ] satisfies (keyof I18nAttrs)[];
    }

    protected _template = html`<slot></slot>`;

    constructor() {
        super();
        this._applyTemplate();
    }

    protected _onAttrChanged(_: string, oldValue: string, newValue: string) {
        super._onAttrChanged(_, oldValue, newValue);
        this.updateText();
    }

    connectedCallback() {
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

I18n.define();
