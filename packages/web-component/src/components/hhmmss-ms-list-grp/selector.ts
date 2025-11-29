import { getCurrentTzOffsetMs } from '../../utils';
import { Ele as PopoverEle, type EventMap as PopoverEvent } from '../popover';
import type { Emit2EventMap } from '../web-component-base';
import {
    type Attrs as BaseAttrs,
    BaseEle,
    type BaseEmits,
    type Granularity
} from './base';
import { selectorCss } from './css';
import { selectorHtml } from './html';

export type { Granularity, ColOrder } from './base';
export { granularityList, colOrderList } from './base';

export interface Attrs extends BaseAttrs {
    /** 当前的时间戳 */
    'current-time'?: number | string;
}

export interface Emits extends BaseEmits {
    'select-time': Date;
    'open-change': boolean;
}
export type EventMap = Emit2EventMap<Emits>;

/**
 * 时分秒毫秒下拉选择器。
 * 这个选择器以 current-time 属性作为当前时间的依据。
 * 而 millisecond 属性则表示现在选中的毫秒数（点击Done按钮后才生效的），理论上外部不应该使用。
 */
export class Ele extends BaseEle<Attrs, Emits> {
    public static readonly tagName = 'dt-hhmmss-ms-selector' as const;
    protected static _style = selectorCss;
    protected static _template = selectorHtml;

    static get observedAttributes(): string[] {
        return [
            ...(super.observedAttributes as (keyof BaseAttrs)[]),
            'current-time'
        ] satisfies (keyof Attrs)[];
    }

    get _staticEls() {
        return {
            ...super._staticEls,
            popover: this.$0<PopoverEle>`dt-popover`!,
            timeEcho: this.$0`.time-echo`!
        };
    }

    public set open(v: boolean) {
        this._els.popover.open = v;
    }
    public get open() {
        return this._els.popover.open;
    }

    public connectedCallback() {
        if (!super.connectedCallback()) return;
        this._render();
        this._bindEvt(this._els.popover)('open-change', this._onPopoverChange);
        this._bindEvt<HTMLButtonElement>`button`('click', this._onDoneBtnClick);
    }
    protected _onAttrChanged(
        name: string,
        oldValue: string | null,
        newValue: string | null
    ) {
        super._onAttrChanged(name, oldValue, newValue);
        if (name === 'millisecond') return;
        this._render();
    }

    public get currentTime() {
        const v = this._getAttr('current-time', '' + Date.now());
        return new Date(Number.isNaN(+v) ? v : +v);
    }
    public set currentTime(val: number | string | Date) {
        const v = new Date(val);
        if (Number.isNaN(+v)) return;
        this.setAttribute('current-time', +v + '');
    }

    private _render = super._genRenderFn(() => {
        const tz = getCurrentTzOffsetMs();
        this.millisecond = (+this.currentTime - tz) % (24 * 60 * 60 * 1000);
        this._els.timeEcho.textContent = this.timeFormatter(
            this.currentTime as Date,
            this.minGranularity
        );
    });

    private _onPopoverChange = (e: PopoverEvent['open-change']) => {
        if (!(e.target instanceof PopoverEle)) return;
        if (!e.detail) return this._render();
        this.scrollToCurrentItem();
    };

    private _onDoneBtnClick = (_e: Event) => {
        const calcTime = (time: Date, ms: number) => {
            time.setHours(0, 0, 0, 0);
            time.setMilliseconds(ms);
            return time;
        };
        const time = calcTime(this.currentTime as Date, this.millisecond);
        this.currentTime = time;
        this.dispatchEvent('select-time', time);
        this._render();
        this.open = false;
    };

    public timeFormatter = (time: Date, minGranularity: Granularity) => {
        const t = new Date(+time - getCurrentTzOffsetMs())
            .toISOString()
            .slice(11, 23);
        if (minGranularity === 'hour') return t.slice(0, 2);
        if (minGranularity === 'minute') return t.slice(0, 5);
        if (minGranularity === 'second') return t.slice(0, 8);
        return t;
    };
}

Ele.define();
