import type { Lang } from '../../i18n';
import { css } from '../../utils';
// import styleStr from './index.scss?inline';
const styleStr = css`
/* firefox only: */
@-moz-document url-prefix() {
  :host, * {
    scrollbar-width: thin;
    scrollbar-color: var(--scrollbar-thumb-color, #4444) transparent;
  }
  :host:hover, *:hover {
    scrollbar-color: var(--scrollbar-thumb-color-hover, var(--scrollbar-thumb-color, #8888)) transparent;
  }
}
`;
// import scrollbarStyleStr from './scrollbar.scss?inline';
const scrollbarStyleStr = css`
[dt]::-webkit-scrollbar, :host *::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}
[dt]::-webkit-scrollbar-button, :host *::-webkit-scrollbar-button {
  display: none;
}
[dt]::-webkit-scrollbar-corner, :host *::-webkit-scrollbar-corner {
  display: none;
}
[dt]::-webkit-scrollbar-thumb, :host *::-webkit-scrollbar-thumb {
  background-color: var(--scrollbar-thumb-color, #4444);
  border-radius: 4px;
  cursor: grab;
}
[dt]::-webkit-scrollbar-thumb:hover, :host *::-webkit-scrollbar-thumb:hover {
  background-color: var(--scrollbar-thumb-color-hover, var(--scrollbar-thumb-color, #8888));
}
[dt]::-webkit-scrollbar-thumb:active, :host *::-webkit-scrollbar-thumb:active {
  background-color: var(--scrollbar-thumb-color-active, var(--scrollbar-thumb-color, #2222));
  cursor: grabbing;
}
[dt]::-webkit-scrollbar-track, :host *::-webkit-scrollbar-track {
  background: transparent;
}
`;

type EmitType = Record<string, any>;

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

if (typeof document === 'object') {
    // const styleEle = document.createElement('style');
    // styleEle.innerHTML = scrollbarStyleStr;
    // document.head.prepend(styleEle);
    const styleSheet = new CSSStyleSheet();
    styleSheet.replaceSync(scrollbarStyleStr);
    document.adoptedStyleSheets.unshift(styleSheet);
}

const HTMLElementBase = (() => {
    if (typeof HTMLElement === 'function') return HTMLElement;
    return class {} as typeof HTMLElement;
})();

export class UiBase<
    Attr extends BaseAttrs = BaseAttrs,
    Emit extends Record<string, any> = {}
> extends HTMLElementBase {
    protected static tagName = '';
    protected static _definePromise: Promise<CustomElementConstructor> | null =
        null;
    public static define() {
        if (this._definePromise) return this._definePromise;
        if (typeof customElements === 'undefined') {
            return;
        }
        const tagName = this.tagName;
        if (!tagName) throw new Error('UiBase.define: tagName is not defined.');
        console.log('Define custom element:', tagName);
        customElements.define(tagName, this);
        return (this._definePromise = customElements.whenDefined(tagName));
    }

    // TODO: use override keyword in subclasses
    static get observedAttributes(): string[] {
        return ['lang'] satisfies (keyof BaseAttrs)[];
    }

    protected _template = '';
    protected _style = '';
    protected _initTemplate() {
        const { tagName } = this;
        if (templateCache.has(tagName)) return templateCache.get(tagName)!;
        const templateEle = document.createElement('template');
        templateEle.innerHTML = `<style>${scrollbarStyleStr}${styleStr}${this._style}</style>${this._template}`;
        templateCache.set(tagName, templateEle);
        return templateEle;
    }
    protected _applyTemplate() {
        if (!this.shadowRoot) return;
        this.shadowRoot.innerHTML = '';
        this.shadowRoot.appendChild(
            this._initTemplate().content.cloneNode(true)
        );
    }

    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    protected _getAttr<
        K extends keyof Attr,
        D extends undefined | getAttrType<Attr, K> = undefined
    >(
        qualifiedName: K,
        defaultValue?: D
    ): undefined extends D
        ? getAttrType<Attr, K> | null
        : getAttrType<Attr, K> {
        const attr = this.getAttribute(qualifiedName as string);
        return (
            attr === null && defaultValue !== void 0 ? defaultValue : attr
        ) as getAttrType<Attr, K>;
    }

    protected _onAttrChanged(_name: string, _oldVal: string, _newVal: string) {}

    attributeChangedCallback(name: string, oldValue: string, newValue: string) {
        if (oldValue === newValue) return;
        if (name !== 'lang')
            return this._onAttrChanged(name, oldValue, newValue);
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

    dispatchEvent<K extends keyof Emit | undefined = undefined>(
        type: K | Event,
        data?: K extends keyof Emit ? Emit[K] : any,
        global = false
    ) {
        return type instanceof Event
            ? super.dispatchEvent(type)
            : super.dispatchEvent(
                  new CustomEvent(type as string, {
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
}
