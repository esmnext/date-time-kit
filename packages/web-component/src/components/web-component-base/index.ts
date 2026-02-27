import { langs } from '../../i18n';
import { debounce, smallScreenObserver } from '../../utils';
import { enumAttr } from './attr-accessor';
import type { AttrAccessor } from './attr-accessor/types';
import { scrollbarStyleStr, styleStr } from './css';
export * from './attr-accessor';

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

// tagName to template element cache
const templateCache = new Map<string, HTMLTemplateElement>();

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

type Elements = HTMLElement | HTMLElement[];

class DtCustomEleBase extends HTMLElementBase {
    public static readonly tagName?: `dt-${string}`;
    protected static _definePromise: Promise<CustomElementConstructor> | null =
        null;
    public static define() {
        if (this._definePromise) return this._definePromise;
        if (typeof customElements === 'undefined') {
            return Promise.resolve(this);
        }
        const tagName = this.tagName;
        if (!tagName)
            throw new Error(this.name + '.define: tagName is not defined.');
        this._definePromise = customElements.whenDefined(tagName);
        customElements.define(tagName, this);
        return this._definePromise;
    }

    static get observedAttributes(): string[] {
        return [];
    }

    protected static _style = '';
    protected static _template = '';
    private get _constructor() {
        return this.constructor as typeof DtCustomEleBase;
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

    get _staticEls(): Record<string, Elements> {
        return Object.create(null);
    }
    get _dynamicEls(): Record<string, Elements | undefined> {
        return Object.create(null);
    }
    private _staticElsCache: this['_staticEls'] & this['_dynamicEls'];
    protected get _els(): this['_staticEls'] & this['_dynamicEls'] {
        return Object.assign({}, this._staticElsCache, this._dynamicEls);
    }

    constructor() {
        super();
        const shadowRoot = this.attachShadow({ mode: 'open' });
        shadowRoot.innerHTML = '';
        shadowRoot.appendChild(this._initTemplate().content.cloneNode(true));
        this._staticElsCache = this._staticEls;
    }

    /** Find elements in the shadow DOM */
    protected $<E extends HTMLElement = HTMLElement>(
        selector: string | TemplateStringsArray,
        ...args: unknown[]
    ) {
        if (typeof selector !== 'string')
            selector = String.raw(selector, ...args);
        return [...(this.shadowRoot?.querySelectorAll<E>(selector) || [])];
    }
    /** Find the first element in the shadow DOM */
    protected $0<E extends HTMLElement = HTMLElement>(
        selector: string | TemplateStringsArray,
        ...args: unknown[]
    ): E | undefined {
        return this.$<E>(selector, ...args)[0];
    }

    private _unbindFnCache: (() => void)[] = [];
    protected _bindEvt<Ele>(
        elsOrSelector: Ele | Ele[] | string | TemplateStringsArray,
        ...strSlot: unknown[]
    ): Ele extends string | TemplateStringsArray
        ? HTMLElement['addEventListener']
        : Ele extends { addEventListener: infer F }
          ? F
          : never {
        const els =
            typeof elsOrSelector === 'string'
                ? this.$(elsOrSelector)
                : !Array.isArray(elsOrSelector)
                  ? [elsOrSelector as HTMLElement]
                  : typeof elsOrSelector[0] === 'string'
                    ? this.$(elsOrSelector as any, ...strSlot)
                    : (elsOrSelector as HTMLElement[]);
        return ((...args: Parameters<HTMLElement['addEventListener']>) => {
            els.forEach((el) => {
                el.addEventListener(...args);
                this._unbindFnCache.push(() => el.removeEventListener(...args));
            });
        }) as any;
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
        this._onAttrChanged(name, oldValue, newValue);
        this.dispatchEvent(
            'dt-attribute-changed',
            { name, oldValue, newValue },
            true
        );
        if (name === 'lang')
            this.$<UiBase>`[dt]`.forEach((ele) => {
                if (newValue) ele.setAttribute('lang', newValue);
                else ele.removeAttribute('lang');
            });
    }
    /** return `false | void` means not continue */
    connectedCallback(): boolean | void {
        this.setAttribute('dt', '');
        smallScreenObserver.observe(this, this._onScreenSizeChanged.bind(this));
        return !!this.shadowRoot;
    }
    /** return `false | void` means not continue */
    disconnectedCallback(): boolean | void {
        smallScreenObserver.unobserve(this);
        this._unbindFnCache.forEach((fn) => fn());
        this._unbindFnCache = [];
        return !!this.shadowRoot;
    }
    connectedMoveCallback() {}
    adoptedCallback() {}

    protected _onScreenSizeChanged(isSmall: boolean) {}
    protected get _isSmallScreen() {
        return smallScreenObserver.isSmall;
    }

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

    protected _genRenderFn<F extends (...args: any) => void>(fn: F) {
        return debounce((...args: Parameters<F>) => {
            if (!this.isConnected) return;
            fn(...args);
        }, 0) as F;
    }
}

type Ctor<T = {}> = new (...args: any[]) => T;

export type EleCtor<TEle extends DtCustomEleBase = DtCustomEleBase> =
    Ctor<TEle> & {
        get observedAttributes(): string[];
        tagName?: `dt-${string}`;
        define(): Promise<CustomElementConstructor> | void;
    };

export type PropsFromAccessors<TProps extends Record<string, AttrAccessor>> = {
    // 这里很想用映射类型定义为 getter/setter 访问器，但 ts 本身还不支持在访问器声明中使用类型映射键签名
    // https://stackoverflow.com/questions/73202762/is-there-a-way-to-dynamically-map-keys-to-getters-setters-of-different-types-in
    // https://github.com/microsoft/TypeScript/issues/43826
    [K in keyof TProps]: TProps[K] extends AttrAccessor<infer G> ? G : never;
};

/** 将声明的 attr 转换为访问器，且在实例中注册对应的 `observedAttributes` */
export const EleWithProps = <
    TProps extends Record<string, AttrAccessor>,
    TBase extends EleCtor
>(
    props: TProps,
    BaseEle: TBase
) =>
    class DtCustomEleWithProps extends BaseEle {
        static get observedAttributes() {
            return [
                ...super.observedAttributes,
                ...Object.values(props)
                    .filter((prop) => prop.attrName)
                    .map((prop) => prop.attrName!)
            ];
        }
        constructor(...args: any[]) {
            super(...args);
            for (const [propName, descriptor] of Object.entries(props)) {
                Object.defineProperty(this, propName, descriptor);
            }
        }
    } as TBase & Ctor<PropsFromAccessors<TProps>>;

/** 给元素附加事件发射的ts类型 */
export const EleWithEmits = <TEmit extends BaseEmits, TBase extends EleCtor>(
    /** 没有实际意义，仅为了ts自动类型推断 */
    _emits: TEmit,
    BaseEle: TBase
) =>
    BaseEle as Ctor<{
        dispatchEvent(event: Event): boolean;
        dispatchEvent<K extends keyof TEmit>(
            type: K,
            data: TEmit[K],
            global?: boolean
        ): boolean;
        dispatchEvent(type: string, data?: any, global?: boolean): boolean;

        addEventListener<K extends keyof TEmit>(
            type: K,
            listener: EventListenerOrListenerObj<TEmit, K>,
            options?: boolean | EventListenerOptions
        ): void;
        removeEventListener<K extends keyof TEmit>(
            type: K,
            listener: EventListenerOrListenerObj<TEmit, K>,
            options?: boolean | EventListenerOptions
        ): void;
    }> &
        TBase;

/** 将声明的 attr 转换为访问器，且在实例中注册对应的 `observedAttributes`。同时给元素附加事件发射的 ts 类型。等于 `EleWithProps` + `EleWithEmits` */
export const EleMixin = <
    TProps extends Record<string, AttrAccessor>,
    TEmit extends BaseEmits,
    TBase extends EleCtor
>(
    props: TProps,
    emits: TEmit,
    BaseEle: TBase
) => EleWithEmits(emits, EleWithProps(props, BaseEle));

export class UiBase extends EleMixin(
    {
        lang: enumAttr('lang', {
            validValues: langs,
            defaultValue: 'en-US' as const
        })
    },
    {} as BaseEmits,
    DtCustomEleBase
) {}

export type MixinEle<
    TBase extends typeof UiBase = typeof UiBase,
    TProps extends Record<string, AttrAccessor> = Record<string, never>,
    TEmit extends BaseEmits = BaseEmits,
    TOtherProps extends {} = {}
> = ReturnType<typeof EleMixin<TProps, TEmit, TBase>> &
    EleCtor<UiBase & TOtherProps>;
