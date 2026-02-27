import {
    autoUpdate,
    computePosition,
    flip,
    offset,
    size
} from '@floating-ui/dom';
import { html } from '../../utils';
import {
    type BaseEmits,
    EleMixin,
    type Emit2EventMap,
    UiBase,
    booleanAttr,
    enumAttr,
    intAttr
} from '../web-component-base';
import { popStyleStr } from './css';

export const popProps = {
    open: booleanAttr('open'),
    /** @default 'bottom-start' */
    placement: enumAttr('placement', {
        validValues: [
            'top',
            'bottom',
            'left',
            'right',
            'top-start',
            'top-end',
            'bottom-start',
            'bottom-end',
            'left-start',
            'left-end',
            'right-start',
            'right-end'
        ],
        defaultValue: 'bottom-start'
    }),
    /** @default 'fixed' */
    strategy: enumAttr('strategy', {
        validValues: ['absolute', 'fixed'],
        defaultValue: 'fixed'
    }),
    /** @default 0 */
    offset: intAttr('offset'),
    minWidthWithTrigger: booleanAttr('min-width-with-trigger')
};

export interface PopEmits extends BaseEmits {
    'open-change': boolean;
    positioned: void;
}
export type PopEventMap = Emit2EventMap<PopEmits>;

/**
 * 独立的气泡元素，挂载到 body 上
 * 通过 data-popover-id 与触发器关联
 */
export class PopEle extends EleMixin(popProps, {} as PopEmits, UiBase) {
    public static readonly tagName = 'dt-popover-pop' as const;
    protected static _style = popStyleStr;
    protected static _template = html`<slot></slot>`;

    /** 关联的触发器元素 */
    private _triggerEle: HTMLElement | null = null;
    /** 关联的 popover 控制器元素 */
    private _popoverController: HTMLElement | null = null;

    get _staticEls() {
        return {
            ...super._staticEls,
            slot: this.$0<HTMLSlotElement>`slot`!
        } as const;
    }

    /** 设置触发器元素 */
    public setTrigger(trigger: HTMLElement | null) {
        this._triggerEle = trigger;
    }

    /** 设置控制器元素（用于事件分发） */
    public setController(controller: HTMLElement | null) {
        this._popoverController = controller;
    }

    public connectedCallback() {
        if (!super.connectedCallback()) return;
        // 初始隐藏
        this.hidden = true;
    }

    public disconnectedCallback() {
        this._cleanupAutoUpdate?.();
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
        this.hidden = !isOpen;
        if (isOpen) {
            this._autoUpdatePosition();
        } else {
            this._cleanupAutoUpdate?.();
        }
        this.dispatchEvent('open-change', this.open, true);
    }

    private _cleanupAutoUpdate: null | (() => void) = null;
    private _autoUpdatePosition() {
        this._cleanupAutoUpdate?.();
        if (!this._triggerEle) return;

        const updatePosition = async () => {
            const { strategy } = this;
            const { x, y } = await computePosition(this._triggerEle!, this, {
                placement: this.placement,
                strategy: strategy,
                middleware: [
                    offset(this.offset),
                    flip(),
                    size({
                        apply: ({ elements, rects }) => {
                            if (!this.hasAttribute('min-width-with-trigger'))
                                return;
                            elements.floating.style.minWidth =
                                rects.reference.width + 'px';
                        }
                    })
                ]
            });
            function roundByDPR(value: number) {
                const dpr = window.devicePixelRatio || 1;
                return Math.round(value * dpr) / dpr;
            }
            this.style.transform = `translate(${roundByDPR(x)}px, ${roundByDPR(y)}px)`;
            this.dispatchEvent('positioned', void 0, true);
        };
        const cleanup = autoUpdate(this._triggerEle, this, updatePosition);
        this._cleanupAutoUpdate = () => {
            cleanup();
            this._cleanupAutoUpdate = null;
            this.style.transform = '';
        };
    }

    public get open() {
        return this.hasAttribute('open');
    }
    public set open(v: boolean) {
        this.toggleAttribute('open', v);
    }
}

PopEle.define();
