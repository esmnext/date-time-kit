import { granHelper } from '../../utils';
import type { Ele as EchoEle } from '../echo';
import type { DateFormatterFn } from '../echo/utils';
import { Ele as PopoverEle, type EventMap as PopoverEvent } from '../popover';
import {
    clearupPopEleAttrSync2Parent,
    isPopoverAttrKey,
    parentPopAttrSync2PopEle,
    popEleAttrSync2Parent,
    popoverAttrKeys,
    type reExportPopoverAttrs
} from '../popover/attr-sync-helper';
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

export type Attrs = BaseAttrs &
    reExportPopoverAttrs & {
        /** 当前的时间戳 */
        'current-time'?: number | string;
    };

export interface Emits extends BaseEmits {
    /** 点击 Done 按钮后抛出，值为 `current-time` */
    'select-time': Date;
    'open-change': boolean;
}
export type EventMap = Emit2EventMap<Emits>;

/**
 * 年月日下拉选择器。
 *
 * 这个选择器以 `current-time` 属性作为当前时间的依据（特别是时分秒）。
 * 而 `millisecond` 属性则表示现在选中的毫秒数（随着用户操作时实时更新），理论上外部不应直接使用。
 */
export class Ele extends BaseEle<Attrs, Emits> {
    public static readonly tagName = 'dt-yyyymmdd-selector' as const;
    protected static _style = selectorCss;
    protected static _template = selectorHtml;

    static get observedAttributes(): string[] {
        return [
            ...(super.observedAttributes as (keyof BaseAttrs)[]),
            'current-time',
            ...popoverAttrKeys
        ] satisfies (keyof Attrs)[];
    }

    get _staticEls() {
        return {
            ...super._staticEls,
            popover: this.$0<PopoverEle>`dt-popover`!,
            dateEcho: this.$0<EchoEle>`dt-echo`!
        } as const;
    }

    public set open(v: boolean) {
        this.toggleAttribute('pop-open', v);
    }
    public get open() {
        return this.hasAttribute('pop-open');
    }

    public connectedCallback() {
        if (!super.connectedCallback()) return;
        this._render();
        const { _els } = this;
        popEleAttrSync2Parent(this, _els.popover);
        this._bindEvt(_els.popover)('open-change', this._onPopoverChange);
        this._bindEvt<HTMLButtonElement>`button`('click', this._onDoneBtnClick);
    }
    public disconnectedCallback() {
        clearupPopEleAttrSync2Parent(this);
        return super.disconnectedCallback();
    }

    protected _onAttrChanged(
        name: string,
        oldValue: string | null,
        newValue: string | null
    ) {
        super._onAttrChanged(name, oldValue, newValue);
        if (name === 'millisecond') return;
        if (isPopoverAttrKey(name)) {
            parentPopAttrSync2PopEle(
                name,
                oldValue,
                newValue,
                this._els.popover
            );
            return;
        }
        this._render();
    }

    /** 当前日期，带时分秒，`select-time` 事件抛出时，时分秒来自这里，年月日来自 `millisecond`。 */
    public get currentTime(): Date {
        const v = this._getAttr('current-time', '' + Date.now());
        return new Date(Number.isNaN(+v) ? v : +v);
    }
    public set currentTime(val: number | string | Date) {
        const v = new Date(val);
        if (Number.isNaN(+v)) return;
        this.setAttribute('current-time', +v + '');
    }

    private _render = super._genRenderFn(() => {
        if (!this.isConnected) return;
        const { currentTime, _minmaxGran } = this;
        this.millisecond = +currentTime;
        Object.assign(this._els.dateEcho, {
            currentTime: currentTime,
            minGranularity: _minmaxGran.min,
            maxGranularity: _minmaxGran.max
        } as Partial<EchoEle>);
    });

    private _onPopoverChange = (e: PopoverEvent['open-change']) => {
        if (!(e.target instanceof PopoverEle)) return;
        this._els.dateEcho.active = e.detail;
        if (!e.detail) return this._render();
        this.scrollToCurrentItem();
    };

    private _onDoneBtnClick = (_e: Event) => {
        // 时分秒以 currentTime 为准，年月日以 millisecond 为准，更新并抛出新的 currentTime
        const oldTime = new Date(this.currentTime);
        const newTime = new Date(this.millisecond);
        oldTime.setFullYear(newTime.getFullYear());
        oldTime.setMonth(newTime.getMonth());
        oldTime.setDate(newTime.getDate());
        const time = oldTime;
        this.currentTime = time;
        this.dispatchEvent('select-time', time);
        this._render();
        this.open = false;
    };

    /** 日期回显格式化函数。设置为 `null` 则重置为默认值 */
    public get dateFormatter(): DateFormatterFn {
        return this._els.dateEcho.dateFormatter;
    }
    public set dateFormatter(fn: DateFormatterFn | null) {
        this._els.dateEcho.dateFormatter = fn;
    }
}

Ele.define();
