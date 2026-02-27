import { getCurrentTzOffsetMs } from '../../utils';
import type { Ele as EchoEle } from '../echo';
import type { TimeFormatterFn } from '../echo/utils';
import {
    MixinPopover,
    Ele as PopoverEle,
    type EventMap as PopoverEvent
} from '../popover';
import {
    EleMixin,
    type Emit2EventMap,
    UiBase,
    booleanAttr,
    timeAttr
} from '../web-component-base';
import { type BaseEmits, MixinHhmmssBaseEle } from './base';
import { selectorCss } from './css';
import { selectorHtml } from './html';

export type { Granularity, ColOrder } from './base';
export { granularityList, colOrderList } from './base';

export const props = {
    /** 当前日期，带年月日，`select-time` 事件抛出时，年月日来自这里，时分秒来自 `millisecond`。 */
    currentTime: timeAttr('current-time'),
    /** 下拉选择器是否打开 */
    open: booleanAttr('pop-open')
};

export interface Emits extends BaseEmits {
    'select-time': Date;
    'open-change': boolean;
}
export type EventMap = Emit2EventMap<Emits>;

/**
 * 时分秒毫秒下拉选择器。
 *
 * 这个选择器以 `current-time` 属性作为当前时间的依据（特别是年月日）。
 * 而 `millisecond` 属性则表示现在选中的毫秒数（随着用户操作时实时更新），理论上外部不应直接使用。
 */
export class Ele extends EleMixin(
    props,
    {} as Emits,
    MixinHhmmssBaseEle(MixinPopover())
) {
    public static readonly tagName = 'dt-hhmmss-ms-selector';
    protected static _style = selectorCss;
    protected static _template = selectorHtml;

    get _staticEls() {
        return {
            ...super._staticEls,
            popover: this.$0<PopoverEle>`dt-popover`!,
            timeEcho: this.$0<EchoEle>`dt-echo`!
        };
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
        const tz = getCurrentTzOffsetMs();
        const { currentTime, _minmaxGran } = this;
        this.millisecond = (+currentTime - tz) % (24 * 60 * 60 * 1000);
        Object.assign(this._els.timeEcho, {
            currentTime: currentTime,
            minGranularity: _minmaxGran.min,
            maxGranularity: _minmaxGran.max
        } as Partial<EchoEle>);
    });

    private _onPopoverChange = (e: PopoverEvent['open-change']) => {
        if (!(e.target instanceof PopoverEle)) return;
        this._els.timeEcho.active = e.detail;
        if (!e.detail) return this._render();
        this.scrollToCurrentItem();
    };

    private _onDoneBtnClick = (_e: Event) => {
        const calcTime = (time: Date, ms: number) => {
            time.setHours(0, 0, 0, 0);
            time.setMilliseconds(ms);
            return time;
        };
        const time = calcTime(this.currentTime, this.millisecond);
        this.currentTime = time;
        this.dispatchEvent('select-time', time);
        this._render();
        this.open = false;
    };

    /** 时间回显格式化函数。设置为 `null` 则重置为默认值 */
    public get timeFormatter(): TimeFormatterFn {
        return this._els.timeEcho.timeFormatter;
    }
    public set timeFormatter(fn: TimeFormatterFn | null) {
        this._els.timeEcho.timeFormatter = fn;
    }
}

Ele.define();
