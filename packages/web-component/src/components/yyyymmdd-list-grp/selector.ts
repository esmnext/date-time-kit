import type { Ele as EchoEle } from '../echo';
import type { DateFormatterFn } from '../echo/utils';
import {
    MixinPopover,
    Ele as PopoverEle,
    type EventMap as PopoverEvent
} from '../popover';
import {
    EleMixin,
    type Emit2EventMap,
    booleanAttr,
    timeAttr
} from '../web-component-base';
import { type BaseEmits, MixinYyyymmddBaseEle } from './base';
import { selectorCss } from './css';
import { selectorHtml } from './html';

export type { Granularity, ColOrder } from './base';
export { granularityList, colOrderList } from './base';

export const props = {
    /** 当前日期，带时分秒，`select-time` 事件抛出时，时分秒来自这里，年月日来自 `millisecond`。 */
    currentTime: timeAttr('current-time'),
    /** 下拉选择器是否打开 */
    open: booleanAttr('pop-open')
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
export class Ele extends EleMixin(
    props,
    {} as Emits,
    MixinYyyymmddBaseEle(MixinPopover())
) {
    public static readonly tagName = 'dt-yyyymmdd-selector' as const;
    protected static _style = selectorCss;
    protected static _template = selectorHtml;

    get _staticEls() {
        return {
            ...super._staticEls,
            popover: this.$0<PopoverEle>`dt-popover`!,
            dateEcho: this.$0<EchoEle>`dt-echo`!
        } as const;
    }

    public connectedCallback() {
        if (!super.connectedCallback()) return;
        this._render();
        const { _els } = this;
        this._bindEvt(_els.popover)('open-change', this._onPopoverChange);
        this._bindEvt<HTMLButtonElement>`button`('click', this._onDoneBtnClick);
    }

    protected _onAttrChanged(
        name: string,
        oldValue: string | null,
        newValue: string | null
    ) {
        super._onAttrChanged(name, oldValue, newValue);
        if (name === 'millisecond' || this._isPopoverAttrKey(name)) return;
        this._render();
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
