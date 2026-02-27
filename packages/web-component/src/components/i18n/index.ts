import i18n, { langs } from "../../i18n";
import { EleWithProps, strAttr, UiBase } from "../web-component-base";
import { css, html } from "../../utils";

export const props = {
    i18nKey: strAttr('i18n-key')
};

export class Ele extends EleWithProps(props, UiBase) {
    public static readonly tagName = 'dt-i18n' as const;
    protected static _style = css`:host{display:contents}`;
    protected static _template = html`<slot></slot>`;

    protected _onAttrChanged(name: string, oldValue: string, newValue: string) {
        super._onAttrChanged(name, oldValue, newValue);
        if (name === 'lang' || name === 'i18n-key')
            this.updateText();
    }

    connectedCallback() {
        if (!super.connectedCallback()) return;
        this.updateText();
    }

    public updateText() {
        let lang = this.lang;
        let text: any = i18n[lang];
        const keys = (this.i18nKey || '').split('.');
        for (const k of keys) {
            text = text?.[k];
            if (!text) break;
        }
        if (text) this.textContent = text;
    }
}

Ele.define();
