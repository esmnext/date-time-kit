
// tagName to template element cache
const templateCache = new Map<string, HTMLTemplateElement>();

export class UiBase extends HTMLElement {
    static get observedAttributes() {
        return ['lang'];
    }

    protected _template: string = '';
    protected _style: string = '';
    protected _initTemplate() {
        const { tagName } = this;
        if (templateCache.has(tagName))
            return templateCache.get(tagName)!;
        const templateEle = document.createElement('template');
        templateEle.innerHTML =
            (this._style && `<style>${this._style}</style>`)
            + this._template;
        templateCache.set(tagName, templateEle);
        return templateEle;
    };
    protected _applyTemplate() {
        if (!this.shadowRoot) return;
        this.shadowRoot.innerHTML = '';
        this.shadowRoot.appendChild(this._initTemplate().content.cloneNode(true));
    }

    constructor() {
        super();
        this.setAttribute('dt', '');
        this.attachShadow({ mode: 'open' });
    }

    attributeChangedCallback(name: string, oldValue: string, newValue: string) {
        if (oldValue === newValue || name !== 'lang') return;
        this.shadowRoot?.querySelectorAll('[dt]').forEach((ele) => {
            if (newValue) {
                ele.setAttribute('lang', newValue);
            } else {
                ele.removeAttribute('lang');
            }
        });
    }
}

/**
 * 类装饰器：自动注册自定义元素
 * @param tagName 自定义元素的标签名，会在前面自动添加 `dt-` 前缀
 * @returns 类装饰器函数
 */
export function DefEle(tagName: string) {
    return function <T extends CustomElementConstructor>(constructor: T, _ctx: ClassDecoratorContext): T {
        console.log('DefEle:', tagName);
        customElements.define('dt-' + tagName, constructor);
        return constructor;
    };
}
