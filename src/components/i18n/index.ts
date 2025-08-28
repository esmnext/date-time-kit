import i18n, { langs } from "@/i18n";
import { BaseAttrs, DefEle, UiBase } from "@/components/web-component-base";
import { html } from "@/utils";

export interface I18nAttrs extends BaseAttrs {
    'i18n-key'?: string;
}

@DefEle('i18n')
export class I18n extends UiBase<I18nAttrs> {
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
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let text: any = i18n[lang];
        const keys = (this._getAttr('i18n-key') || '').split('.');
        for (const k of keys) {
            text = text?.[k];
            if (!text) break;
        }
        if (text) this.textContent = text;
    }
}
