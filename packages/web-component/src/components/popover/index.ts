import {
    autoUpdate,
    computePosition,
    flip,
    offset,
    shift
} from '@floating-ui/dom';
import { html, smallScreenObserver } from '../../utils';
import {
    type BaseAttrs,
    type BaseEmits,
    type Emit2EventMap,
    UiBase
} from '../web-component-base';
import { styleStr } from './css';

export type { reExportPopoverAttrs as reExportAttrs } from './attr-sync-helper';

export interface Attrs extends BaseAttrs {
    open?: boolean;
    disabled?: boolean;
    /** @default 'bottom-start' */
    placement?: `${'top' | 'bottom' | 'left' | 'right'}${'' | '-start' | '-end'}`;
    /** @default 'none' */
    strategy?: 'absolute' | 'fixed' | 'none';
    /** @default 0 */
    offset?: number;
}

export interface Emits extends BaseEmits {
    'open-change': boolean;
}
export type EventMap = Emit2EventMap<Emits>;

const cacheStyle: {
    -readonly [k in keyof CSSStyleDeclaration]?: any;
} = {};
let hiddenCount = 0;
const hiddenBodyOverflow = () => {
    if (hiddenCount++) return;
    const { style } = document.body;
    (Array.from(style) as (keyof CSSStyleDeclaration)[]).forEach((prop) => {
        cacheStyle[prop] = style[prop];
    });
    style.overflow = 'hidden';
};
const resetBodyOverflow = () => {
    if (--hiddenCount > 0) return;
    const { style } = document.body;
    style.overflow = '';
    for (const prop in cacheStyle) {
        style[prop] = cacheStyle[prop];
        Reflect.deleteProperty(cacheStyle, prop);
    }
};

/**
 * 点击触发器后气泡弹出
 */
export class Ele extends UiBase<Attrs, Emits> {
    public static readonly tagName = 'dt-popover' as const;
    protected static _style = styleStr;
    protected static _template =
        html`<slot name="trigger" part="trigger"></slot><slot name="pop" part="pop"></slot>`;

    static get observedAttributes(): string[] {
        return [
            ...(super.observedAttributes as (keyof BaseAttrs)[]),
            'open',
            'disabled',
            'placement',
            'strategy',
            'offset'
        ] satisfies (keyof Attrs)[];
    }

    public get open() {
        return this.hasAttribute('open');
    }
    public set open(v: boolean) {
        this.toggleAttribute('open', v);
    }
    public get disabled() {
        return this.hasAttribute('disabled');
    }
    public set disabled(v: boolean) {
        this.toggleAttribute('disabled', v);
    }
    public get placement() {
        return this._getAttr('placement', 'bottom-start');
    }
    public set placement(v: Attrs['placement']) {
        if (v) this.setAttribute('placement', v);
        else this.removeAttribute('placement');
    }
    public get strategy() {
        return this._getAttr('strategy', 'none');
    }
    public set strategy(v: Attrs['strategy']) {
        if (v) this.setAttribute('strategy', v);
        else this.removeAttribute('strategy');
    }
    public get offset() {
        const n = +this._getAttr('offset', '0');
        return Number.isNaN(n) ? 0 : n;
    }
    public set offset(v: number) {
        if (!Number.isNaN(v)) this.setAttribute('offset', v + '');
        else this.removeAttribute('offset');
    }

    get _staticEls() {
        return {
            ...super._staticEls,
            pop: this.$0`slot[name="pop"]`!,
            trigger: this.$0<HTMLSlotElement>`slot[name="trigger"]`!
        } as const;
    }
    private get _triggerAssignedEle() {
        return this._els.trigger.assignedElements({ flatten: true })[0] as
            | HTMLElement
            | undefined;
    }

    /**
     * toggle open state
     * @returns null if disabled, otherwise the new open state
     */
    public toggleOpen = (force = !this.open) => {
        if (this.disabled) return null;
        return (this.open = force);
    };

    public connectedCallback() {
        if (!super.connectedCallback()) return;
        this._bindEvt(this._els.trigger)('click', this._onToggleClick);
        this.strategy = this.strategy;
        smallScreenObserver.observe(this, this._onScreenSizeChange);
    }
    public disconnectedCallback() {
        this._els.trigger.removeEventListener('click', this._onToggleClick);
        smallScreenObserver.unobserve(this);
        return super.disconnectedCallback();
    }

    protected _onAttrChanged(
        name: string,
        oldValue: string | null,
        newValue: string | null
    ) {
        super._onAttrChanged(name, oldValue, newValue);
        if (name !== 'open') return;
        const isOpen = newValue !== null;
        setTimeout(() => {
            document[(isOpen ? 'add' : 'remove') + 'EventListener'](
                'click',
                this._onDocClick,
                true
            );
        });
        const { isSmall } = smallScreenObserver;
        if (!isOpen || this.strategy === 'none' || isSmall)
            this._cleanupAutoUpdate?.();
        else this._autoUpdatePosition();
        if (isSmall) {
            if (isOpen) hiddenBodyOverflow();
            else resetBodyOverflow();
        }
        this.dispatchEvent('open-change', this.open, true);
    }

    private _onToggleClick = () => {
        this.toggleOpen();
    };
    private _onDocClick = (e: MouseEvent) => {
        const popEle = this.querySelector('[slot="pop"]');
        if (popEle) {
            const composedPath = e.composedPath();
            if (composedPath.includes(popEle)) return;
            if (composedPath.includes(this)) {
                const popRect = popEle.getBoundingClientRect();
                if (
                    e.clientX >= popRect.left &&
                    e.clientX <= popRect.right &&
                    e.clientY >= popRect.top &&
                    e.clientY <= popRect.bottom
                ) {
                    return;
                }
            }
        }
        e.stopPropagation();
        e.preventDefault();
        this.open = false;
        document.removeEventListener('click', this._onDocClick, true);
    };

    private _cleanupAutoUpdate: null | (() => void) = null;
    private _autoUpdatePosition() {
        this._cleanupAutoUpdate?.();
        const updatePosition = async () => {
            const { _triggerAssignedEle, _els, strategy } = this;
            if (!_triggerAssignedEle || strategy === 'none') return;
            const { x, y } = await computePosition(
                _triggerAssignedEle,
                _els.pop,
                {
                    placement: this.placement,
                    strategy: strategy,
                    middleware: [
                        offset(this.offset),
                        flip(),
                        shift({ padding: 5 })
                    ]
                }
            );
            function roundByDPR(value: number) {
                const dpr = window.devicePixelRatio || 1;
                return Math.round(value * dpr) / dpr;
            }
            _els.pop.style.transform = `translate(${roundByDPR(x)}px, ${roundByDPR(y)}px)`;
        };
        const cleanup = autoUpdate(
            this._els.trigger,
            this._els.pop,
            updatePosition
        );
        this._cleanupAutoUpdate = () => {
            cleanup();
            this._cleanupAutoUpdate = null;
            this._els.pop.style.transform = '';
        };
    }
    private _onScreenSizeChange = (isSmall: boolean) => {
        if (!this.open || this.strategy === 'none') return;
        if (isSmall) {
            this._cleanupAutoUpdate?.();
            this._els.pop.style.transform = '';
            hiddenBodyOverflow();
        } else {
            this._autoUpdatePosition();
            resetBodyOverflow();
        }
    };
}

Ele.define();
