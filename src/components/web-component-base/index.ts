import { Lang } from "@/i18n";
import styleStr from './index.scss?inline';
import scrollbarStyleStr from './scrollbar.scss?inline';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type EmitType = (eventName: string | any, detailData: any) => any;

type ListenerFn<Emit extends EmitType, K extends keyof HTMLElementEventMap | Parameters<Emit>[0]> =
    (this: HTMLElement, ev: K extends Parameters<Emit>[0]
        ? CustomEvent<Parameters<Emit>[1]>
        : HTMLElementEventMap[K & keyof HTMLElementEventMap]
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ) => any;

type EventListener<Emit extends EmitType, K extends keyof HTMLElementEventMap | Parameters<Emit>[0]> =
    | ListenerFn<Emit, K>
    | { handleEvent: ListenerFn<Emit, K>; };

type getAttrType<Attr, K extends keyof Attr> =
    Extract<Attr[K], string> extends never ? string : Extract<Attr[K], string>;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type CustomEleEventListener<Ele extends UiBase<any, any>, K extends string> =
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Ele extends UiBase<any, infer Emit>
        ? K extends keyof HTMLElementEventMap | Parameters<Emit>[0]
            ? EventListener<Emit, K>
            : never
        : never;


// tagName to template element cache
const templateCache = new Map<string, HTMLTemplateElement>();

export interface BaseAttrs {
    /**
     * The language of the component.
     * @type `Lang`
     */
    'lang'?: Lang;
}

if (typeof document === 'object') {
    // const styleEle = document.createElement('style');
    // styleEle.innerHTML = scrollbarStyleStr;
    // document.head.prepend(styleEle);
    const styleSheet = new CSSStyleSheet();
    styleSheet.replaceSync(scrollbarStyleStr);
    document.adoptedStyleSheets.unshift(styleSheet);
}

export class UiBase<
    Attr extends BaseAttrs = BaseAttrs,
    Emit extends EmitType = () => void
> extends HTMLElement {
    // TODO: use override keyword in subclasses
    static get observedAttributes(): string[] {
        return ['lang'] satisfies (keyof BaseAttrs)[];
    }

    protected _template: string = '';
    protected _style: string = '';
    protected _initTemplate() {
        const { tagName } = this;
        if (templateCache.has(tagName))
            return templateCache.get(tagName)!;
        const templateEle = document.createElement('template');
        templateEle.innerHTML = `<style>${scrollbarStyleStr}${styleStr}${this._style}</style>${this._template}`;
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

    protected _getAttr<K extends keyof Attr, D extends undefined | getAttrType<Attr, K> = undefined>(
        qualifiedName: K, defaultValue?: D
    ): undefined extends D ? (getAttrType<Attr, K> | null) : getAttrType<Attr, K> {
        const attr = this.getAttribute(qualifiedName as string);
        return (
            attr === null && defaultValue !== void 0 ? defaultValue : attr
        ) as getAttrType<Attr, K>;
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

    dispatchEvent(
        type: Parameters<Emit>[0] | Event,
        data?: Parameters<Emit>[1],
        global = false
    ) {
        return type instanceof Event
            ? super.dispatchEvent(type)
            : super.dispatchEvent(new CustomEvent(type, {
                ...(global ? {
                    bubbles: true,
                    cancelable: true,
                    composed: true,
                } : {}),
                detail: data,
            }));
    }

    public addEventListener<K extends keyof HTMLElementEventMap | Parameters<Emit>[0]>(
        type: K | string, listener: EventListener<Emit, K>, options?: boolean | EventListenerOptions
    ): void {
        super.addEventListener(type as string, listener as EventListenerOrEventListenerObject, options);
    }
    public removeEventListener<K extends keyof HTMLElementEventMap | Parameters<Emit>[0]>(
        type: K | string, listener: EventListener<Emit, K>, options?: boolean | EventListenerOptions
    ): void {
        super.removeEventListener(type as string, listener as EventListenerOrEventListenerObject, options);
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
