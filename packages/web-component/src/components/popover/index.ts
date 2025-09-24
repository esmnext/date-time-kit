import {
    autoUpdate,
    computePosition,
    flip,
    offset,
    shift
} from '@floating-ui/dom';
import { css, html, smallScreenObserver } from '../../utils';
import {
    type BaseAttrs,
    type BaseEmits,
    type Emit2EventMap,
    UiBase
} from '../web-component-base';
import { styleStr } from './css';

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

/**
 * 点击触发器后气泡弹出
 */
export class Ele extends UiBase<Attrs, Emits> {
    public static readonly tagName = 'dt-popover' as const;

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

    protected _style = styleStr;
    protected _template =
        html`<slot name="trigger" part="trigger"></slot><slot name="pop" part="pop"></slot>`;

    constructor() {
        super();
        this._applyTemplate();
    }

    private get _popEle() {
        return this.shadowRoot?.querySelector(
            'slot[name="pop"]'
        ) as HTMLDivElement;
    }
    private get _triggerEle() {
        return this.shadowRoot?.querySelector(
            'slot[name="trigger"]'
        ) as HTMLSlotElement;
    }
    private get _triggerAssignedEle() {
        return this._triggerEle.assignedElements({ flatten: true })[0] as
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
        this._triggerEle.addEventListener('click', this._onToggleClick);
        this.strategy = this.strategy;
        smallScreenObserver.observe(this, this._onScreenSizeChange);
    }
    public disconnectedCallback() {
        if (!super.disconnectedCallback()) return;
        this._triggerEle.removeEventListener('click', this._onToggleClick);
        smallScreenObserver.unobserve(this);
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
        if (!isOpen || this.strategy === 'none' || smallScreenObserver.isSmall)
            this._cleanupAutoUpdate?.();
        else this._autoUpdatePosition();
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
            const { _triggerAssignedEle, _popEle, strategy } = this;
            if (!_triggerAssignedEle || strategy === 'none') return;
            const { x, y } = await computePosition(
                _triggerAssignedEle,
                _popEle,
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
            _popEle.style.transform = `translate(${roundByDPR(x)}px, ${roundByDPR(y)}px)`;
        };
        const cleanup = autoUpdate(
            this._triggerEle,
            this._popEle,
            updatePosition
        );
        this._cleanupAutoUpdate = () => {
            cleanup();
            this._cleanupAutoUpdate = null;
        };
    }
    private _onScreenSizeChange = (isSmall: boolean) => {
        if (!this.open || this.strategy === 'none') return;
        if (isSmall) {
            this._cleanupAutoUpdate?.();
            this._popEle.style.transform = '';
        } else {
            this._autoUpdatePosition();
        }
    };
}

Ele.define();
