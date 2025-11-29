import type { Lang } from '../../i18n';
import { debounce } from '../../utils';
import { scrollbarStyleStr, styleStr } from './css';

type EmitType = Record<string, any>;
export type Emit2EventMap<Emit extends EmitType> = {
    [K in keyof Emit]: CustomEvent<Emit[K]>;
};

export type ListenerFn<
    Emit extends EmitType,
    K extends keyof Emit | keyof HTMLElementEventMap
> = (
    this: HTMLElement,
    ev: K extends keyof Emit
        ? CustomEvent<Emit[K]>
        : HTMLElementEventMap[K & keyof HTMLElementEventMap]
) => any;

export type EventListenerObj<
    Emit extends EmitType,
    K extends keyof Emit | keyof HTMLElementEventMap
> = { handleEvent: ListenerFn<Emit, K> };

export type EventListenerOrListenerObj<
    Emit extends EmitType,
    K extends keyof Emit | keyof HTMLElementEventMap
> = ListenerFn<Emit, K> | EventListenerObj<Emit, K>;

type getAttrType<Attr, K extends keyof Attr> = Extract<
    Attr[K],
    string
> extends never
    ? string
    : Extract<Attr[K], string>;

// tagName to template element cache
const templateCache = new Map<string, HTMLTemplateElement>();

export interface BaseAttrs {
    /**
     * The language of the component.
     * @type `Lang`
     */
    lang?: Lang;
}

export interface BaseEmits {
    'dt-attribute-changed': {
        name: string;
        oldValue: string | null;
        newValue: string | null;
    };
}

if (typeof document === 'object') {
    try {
        const styleSheet = new CSSStyleSheet();
        styleSheet.replaceSync(scrollbarStyleStr);
        document.adoptedStyleSheets.unshift(styleSheet);
    } catch {
        const styleEle = document.createElement('style');
        styleEle.innerHTML = scrollbarStyleStr;
        document.head.prepend(styleEle);
    }
}

const HTMLElementBase = (() => {
    if (typeof HTMLElement === 'function') return HTMLElement;
    return class {} as typeof HTMLElement;
})();

export class UiBase<
    Attr extends BaseAttrs = BaseAttrs,
    Emit extends BaseEmits = BaseEmits
> extends HTMLElementBase {
    public static readonly tagName: string = '';
    protected static _definePromise: Promise<CustomElementConstructor> | null =
        null;
    public static define() {
        if (this._definePromise) return this._definePromise;
        if (typeof customElements === 'undefined') {
            return;
        }
        const tagName = this.tagName;
        if (!tagName) throw new Error('UiBase.define: tagName is not defined.');
        customElements.define(tagName, this);
        return (this._definePromise = customElements.whenDefined(tagName));
    }

    // TODO: use override keyword in subclasses
    static get observedAttributes(): string[] {
        return ['lang'] satisfies (keyof BaseAttrs)[];
    }

    protected static _style = '';
    protected static _template = '';
    private get _constructor() {
        return this.constructor as typeof UiBase;
    }
    private _initTemplate() {
        const { tagName } = this;
        if (templateCache.has(tagName)) return templateCache.get(tagName)!;
        const templateEle = document.createElement('template');
        templateEle.innerHTML = `<style>${scrollbarStyleStr}${styleStr}${
            this._constructor._style
        }</style>${this._constructor._template}`;
        templateCache.set(tagName, templateEle);
        return templateEle;
    }

    constructor() {
        super();
        const shadowRoot = this.attachShadow({ mode: 'open' });
        shadowRoot.innerHTML = '';
        shadowRoot.appendChild(this._initTemplate().content.cloneNode(true));
    }

    protected _getAttr<K extends keyof Attr>(
        qualifiedName: K
    ): getAttrType<Attr, K> | null;
    protected _getAttr<K extends keyof Attr>(
        qualifiedName: K,
        defaultValue: getAttrType<Attr, K> | string
    ): getAttrType<Attr, K>;
    protected _getAttr<K extends keyof Attr>(
        qualifiedName: K,
        defaultValue?: getAttrType<Attr, K> | string
    ): getAttrType<Attr, K> | null {
        const attr = this.getAttribute(qualifiedName as string);
        return (
            attr === null && defaultValue !== void 0 ? defaultValue : attr
        ) as getAttrType<Attr, K> | null;
    }

    protected _onAttrChanged(
        _name: string,
        _oldVal: string | null,
        _newVal: string | null
    ) {}

    attributeChangedCallback(
        name: string,
        oldValue: string | null,
        newValue: string | null
    ) {
        if (oldValue === newValue) return;
        if (name !== 'lang') {
            this._onAttrChanged(name, oldValue, newValue);
            this.dispatchEvent(
                'dt-attribute-changed',
                { name, oldValue, newValue },
                true
            );
            return;
        }
        this.shadowRoot?.querySelectorAll('[dt]').forEach((ele) => {
            if (newValue) {
                ele.setAttribute('lang', newValue);
            } else {
                ele.removeAttribute('lang');
            }
        });
    }
    /** return false | void means not continue */
    connectedCallback(): boolean | void {
        this.setAttribute('dt', '');
        return !!this.shadowRoot;
    }
    /** return false | void means not continue */
    disconnectedCallback(): boolean | void {
        return !!this.shadowRoot;
    }
    connectedMoveCallback() {}
    adoptedCallback() {}

    public dispatchEvent(event: Event): boolean;
    public dispatchEvent<K extends keyof Emit>(
        type: K,
        data: Emit[K],
        global?: boolean
    ): boolean;
    public dispatchEvent(type: string, data?: any, global?: boolean): boolean;
    dispatchEvent(type: string | Event, data?: any, global = false): boolean {
        return type instanceof Event
            ? super.dispatchEvent(type)
            : super.dispatchEvent(
                  new CustomEvent(type, {
                      ...(global
                          ? {
                                bubbles: true,
                                cancelable: true,
                                composed: true
                            }
                          : {}),
                      detail: data
                  })
              );
    }
    protected _stopEvent = (e: Event) => e.stopPropagation();

    public addEventListener<K extends keyof Emit | keyof HTMLElementEventMap>(
        type: K | string,
        listener: EventListenerOrListenerObj<Emit, K>,
        options?: boolean | EventListenerOptions
    ): void {
        super.addEventListener(
            type as string,
            listener as EventListenerOrEventListenerObject,
            options
        );
    }
    public removeEventListener<
        K extends keyof Emit | keyof HTMLElementEventMap
    >(
        type: K | string,
        listener: EventListenerOrListenerObj<Emit, K>,
        options?: boolean | EventListenerOptions
    ): void {
        super.removeEventListener(
            type as string,
            listener as EventListenerOrEventListenerObject,
            options
        );
    }

    protected _genRenderFn<F extends (...args: any) => void>(fn: F) {
        return debounce((...args: Parameters<F>) => {
            if (!this.isConnected) return;
            fn(...args);
        }, 0) as F;
    }
}
