import {
    type DateGranularity,
    type DateTimeGranularity,
    type TimeGranularity,
    closestByEvent,
    granHelper
} from '../../utils';
import {
    type Ele as CalendarBaseEle,
    type EventMap as CalendarBaseEvent,
    type Weeks,
    weekKey
} from '../calendar';
import type { Ele as EchoEle } from '../echo';
import type {
    DateFormatterFn,
    DatetimeFormatterFn,
    TimeFormatterFn
} from '../echo/utils';
import type {
    Ele as HhMmSsMsSelectorEle,
    EventMap as HhMmSsMsSelectorEvent
} from '../hhmmss-ms-list-grp/selector';
import { MixinPopover, type Ele as PopoverEle } from '../popover';
import {
    type BaseEmits,
    EleMixin,
    type Emit2EventMap,
    UiBase,
    clampedTimeAttr,
    enumAttr,
    minmaxGranAttr,
    timeAttr
} from '../web-component-base';
import {
    Ele as YyyyMmNavEle,
    type EventMap as YyyyMmNavEvent
} from '../yyyymm-nav';
import type {
    Ele as YyyyMmDdSelectorEle,
    EventMap as YyyyMmDdSelectorEvt
} from '../yyyymmdd-list-grp/selector';
import { GranType } from './common';
import html from './index.html';
import { styleStr } from './styleStr';

export const granularityList = granHelper.dateTime.list;
export type Granularity = DateTimeGranularity;

const timeAttrs = clampedTimeAttr(
    ['minTime', 'min-time'],
    ['currentTime', 'current-time'],
    ['maxTime', 'max-time']
);
const granAttr = minmaxGranAttr(
    ['minGranularity', 'min-granularity'],
    ['maxGranularity', 'max-granularity']
);

export const props = {
    /**
     * Set which day of the week is the first day.
     * @type `'sun' | 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat'`
     * @default 'sun'
     */
    weekStartAt: enumAttr('week-start-at', {
        validValues: weekKey,
        defaultValue: 'sun'
    }),
    ...timeAttrs,
    /**
     * The time of the calendar.
     * @type {`string | number`} A value that can be passed to the Date constructor.
     * @default Math.min('max-time', Math.max('min-time', Date.now()))
     */
    currentTime: timeAttrs.currentTime,
    /**
     * The showing time, used to determine the month to show on calendar.
     * @type {`string | number`} A value that can be passed to the Date constructor.
     * @default 'current-time'
     */
    showingTime: timeAttr('showing-time', {
        defaultValueFromAttr: 'current-time'
    }),
    ...granAttr,
    /**
     * 选择器的粒度，表示最小可选的时间单位。默认为 millisecond。
     * 例如设置为 'minute'，则表示只能选择到分钟，秒和毫秒将被忽略。忽略的时间单位将被重置为 0。
     */
    minGranularity: granAttr.minGranularity,
    /**
     * 选择器的粒度，表示最大可选的时间单位。默认为 year。
     * 例如设置为 'day'，则表示只能选择到日，年和月秒将被忽略。忽略的时间单位将被重置为 0、1972（离1970最近的闰年）。
     */
    maxGranularity: granAttr.maxGranularity,
    /**
     * The minimum time of the calendar display range.
     * @type {`string | number`} A value that can be passed to the Date constructor.
     */
    minTime: timeAttrs.minTime,
    /**
     * The maximum time of the calendar display range.
     * @type {`string | number`} A value that can be passed to the Date constructor.
     */
    maxTime: timeAttrs.maxTime
};

export interface Emits extends BaseEmits {
    'select-time': Date;
    'open-change': boolean;
}
export type EventMap = Emit2EventMap<Emits>;

/**
 * 日期时间选择器（单个时间点）
 * 包括日历和时分秒毫秒选择。
 *
 * - 存在一个 timeFormatter 方法，用于格式化时分秒毫秒显示时间。
 * - 存在一个 dateFormatter 方法，用于格式化年月日显示时间。
 */
export class Ele extends EleMixin(props, {} as Emits, MixinPopover()) {
    public static readonly tagName = 'dt-date-time-selector';
    protected static _style = styleStr;
    protected static _template = html;

    get _staticEls() {
        return {
            ...super._staticEls,
            hostWrapper: this.$0`.host-wrapper`!,
            nav: this.$0<YyyyMmNavEle>`dt-yyyymm-nav`!,
            calendar: this.$0<CalendarBaseEle>`dt-calendar-base`!,
            timeSelectorInCalendar: this
                .$0<HhMmSsMsSelectorEle>`dt-popover dt-hhmmss-ms-selector`!,
            timeSelectorOnly: this
                .$0<HhMmSsMsSelectorEle>`dt-hhmmss-ms-selector.timeOnly`!,
            dateSelector: this.$0<YyyyMmDdSelectorEle>`dt-yyyymmdd-selector`!,
            timeSelectorInDate: this
                .$0<HhMmSsMsSelectorEle>`dt-yyyymmdd-selector dt-hhmmss-ms-selector`!,
            popover: this.$0<PopoverEle>`dt-popover`!,
            slots: this.$<HTMLSlotElement>`slot`!,
            echoInDate: this.$0<EchoEle>`dt-yyyymmdd-selector dt-echo`!,
            echoInPopover: this.$0<EchoEle>`dt-popover dt-echo`!
        } as const;
    }

    private get _granType() {
        const { isDateGran, isTimeGran } = granHelper.dateTime;
        const { min, max } = this._minmaxGran;

        if (max === 'year' && min === 'day') {
            return GranType.Calendar;
        } else if (isTimeGran(max) && isTimeGran(min)) {
            return GranType.Time;
        } else if (isDateGran(max) && isDateGran(min)) {
            return GranType.Date;
        } else if ((max === 'month' || max === 'day') && isTimeGran(min)) {
            return GranType.DateTime;
        } else {
            return GranType.CalendarTime;
        }
    }

    private _updateSlot() {
        const { _els, _granType } = this;
        const hasSlotTrigger = !!this.querySelector('[slot="trigger"]');
        _els.slots.forEach((slot) => {
            if (slot.matches(`[data-type~='${_granType}']`)) {
                slot.setAttribute('name', 'trigger');
            } else {
                slot.removeAttribute('name');
            }
            if (slot.matches(`[data-type~='${GranType.Time}']`)) {
                if (hasSlotTrigger) {
                    slot.setAttribute('slot', 'trigger');
                } else {
                    slot.removeAttribute('slot');
                }
            }
        });
    }

    private _updateOpenState(force = this.hasAttribute('pop-open')) {
        const { _els, _granType } = this;
        const isDateGran =
            _granType === GranType.Date || _granType === GranType.DateTime;
        const isCalendarGran =
            _granType === GranType.Calendar ||
            _granType === GranType.CalendarTime;
        const isTimeGran = _granType === GranType.Time;
        // use toggleAttribute to avoid element not connected yet
        _els.popover.toggleAttribute('open', force && isCalendarGran);
        _els.echoInPopover.toggleAttribute('active', force && isCalendarGran);
        _els.dateSelector.toggleAttribute('pop-open', force && isDateGran);
        _els.echoInDate.toggleAttribute('active', force && isDateGran);
        _els.timeSelectorOnly.toggleAttribute('pop-open', force && isTimeGran);
        this.toggleAttribute('pop-open', force);
    }

    public get open() {
        return this.hasAttribute('pop-open');
    }
    public set open(v: boolean) {
        this._updateOpenState(v);
    }

    private _ob: MutationObserver | null = null;

    public connectedCallback() {
        if (!super.connectedCallback()) return;
        const { _els } = this;
        this._render();
        this._bindEvt(_els.calendar)('select-time', this._onCalendarSelect);
        this._bindEvt(_els.nav)('change', this._onNavChange);
        this._bindEvt(_els.nav)('popover-open-change', this._onNavOpenToggle);
        this._bindEvt([_els.timeSelectorInCalendar, _els.timeSelectorOnly])(
            'select-time',
            this._onTimeSelectorChange
        );
        this._bindEvt([_els.timeSelectorInCalendar, _els.timeSelectorInDate])(
            'open-change',
            this._stopEvent
        );
        this._bindEvt(_els.dateSelector)('open-change', (e) => {
            if (!(this.open = e.detail))
                _els.timeSelectorInDate.currentTime = this.currentTime;
        });
        this._bindEvt(_els.dateSelector)(
            'select-time',
            this._onDateSelectorSelect
        );
        this._bindEvt(_els.timeSelectorOnly)(
            'open-change',
            (e) => (this.open = e.detail)
        );
        this._bindEvt<HTMLButtonElement>`.confirmBtn`(
            'click',
            this._onConfirmBtnClick
        );
        this._ob = new MutationObserver(() => this._updateSlot());
        this._ob.observe(this, { childList: true });
        this.dispatchEvent('select-time', this.currentTime as Date);
    }
    public disconnectedCallback() {
        this._ob?.disconnect();
        this._ob = null;
        return super.disconnectedCallback();
    }
    protected _autoSyncPopAttrAtAttrChange = false;
    protected _onAttrChanged(
        name: string,
        oldValue: string | null,
        newValue: string | null
    ) {
        super._onAttrChanged(name, oldValue, newValue);
        const { _els } = this;
        if (this._isPopoverAttrKey(name)) {
            if (oldValue === newValue) return;
            if (name === 'pop-open') {
                this._updateOpenState();
                return;
            }
            this._syncPopAttrToPopEle(name, newValue);
            if (newValue === null) {
                _els.timeSelectorOnly.removeAttribute(name);
                _els.dateSelector.removeAttribute(name);
                return;
            }
            _els.timeSelectorOnly.setAttribute(name, newValue);
            _els.dateSelector.setAttribute(name, newValue);
            return;
        }
        this._render();
        if (
            name === 'current-time' &&
            this._granType !== GranType.CalendarTime
        ) {
            this.dispatchEvent('select-time', this.currentTime as Date);
        }
    }

    private _render = super._genRenderFn(() => {
        console.log('render');
        this._updateOpenState();
        const currentTime = this.currentTime as Date;
        const { _els, _granType } = this;
        _els.hostWrapper.dataset.type = _granType;
        const { min: minGran, max: maxGran } = this._minmaxGran;

        const gen = <T = DateTimeGranularity>() => ({
            minGranularity: minGran as T,
            maxGranularity: maxGran as T,
            currentTime
        });

        if (_granType !== GranType.Time) {
            Object.assign(_els.echoInPopover, gen());
            Object.assign(_els.echoInDate, gen());
        }
        if (
            _granType === GranType.CalendarTime ||
            _granType === GranType.DateTime
        ) {
            Object.assign(_els.timeSelectorInCalendar, {
                minGranularity: minGran as TimeGranularity,
                currentTime
            });
        }
        if (
            _granType === GranType.Calendar ||
            _granType === GranType.CalendarTime
        ) {
            _els.nav.millisecond = +currentTime;
            const { min, max } = this._minmaxTime;
            Object.assign(_els.calendar, {
                weekStartAt: this.weekStartAt,
                timeStart: +currentTime,
                timeEnd: +currentTime,
                showingTime: this.showingTime,
                minTime: min,
                maxTime: max
            });
        } else if (_granType === GranType.Time) {
            Object.assign(_els.timeSelectorOnly, gen<TimeGranularity>());
        } else if (_granType === GranType.Date) {
            Object.assign(_els.dateSelector, gen<DateGranularity>());
        } else if (_granType === GranType.DateTime) {
            Object.assign(_els.dateSelector, {
                maxGranularity: maxGran as DateGranularity,
                minGranularity: 'day',
                currentTime
            });
            Object.assign(_els.timeSelectorInDate, {
                maxGranularity: 'hour',
                minGranularity: minGran as TimeGranularity,
                currentTime
            });
        }

        this._updateSlot();
    });

    private _onCalendarSelect = (e: CalendarBaseEvent['select-time']) => {
        e.stopPropagation();
        this.currentTime = new Date(
            +e.detail +
                (this._minmaxGran.min === 'day'
                    ? 0
                    : this._els.timeSelectorInCalendar.millisecond)
        );
    };
    private _onNavChange = (e: YyyyMmNavEvent['change']) => {
        e.stopPropagation();
        if (!closestByEvent(e, '.wrapper')) return;
        this._els.calendar.showingTime = e.detail.newTime;
    };
    private _onNavOpenToggle = (e: YyyyMmNavEvent['popover-open-change']) => {
        if (!(e.target instanceof YyyyMmNavEle)) return;
        e.stopPropagation();
        e.target.nextElementSibling?.classList.toggle('hide', e.detail);
    };
    private _onTimeSelectorChange = (
        e: HhMmSsMsSelectorEvent['select-time']
    ) => {
        this.currentTime = e.detail;
    };
    private _onDateSelectorSelect = (e: YyyyMmDdSelectorEvt['select-time']) => {
        e.stopPropagation();
        const time = new Date(e.detail);
        time.setHours(0, 0, 0, 0);
        time.setMilliseconds(this._els.timeSelectorInDate.millisecond);
        this.currentTime = time;
    };
    private _onConfirmBtnClick = () => {
        this.dispatchEvent('select-time', this.currentTime as Date);
        this.open = false;
    };

    /** 时分秒毫秒回显格式化函数。设置为 `null` 则重置为默认值 */
    public get timeFormatter(): TimeFormatterFn {
        return this._els.timeSelectorInCalendar.timeFormatter;
    }
    public set timeFormatter(fn: TimeFormatterFn | null) {
        const { _els } = this;
        _els.timeSelectorInCalendar.timeFormatter =
            _els.timeSelectorOnly.timeFormatter =
            _els.timeSelectorInDate.timeFormatter =
            _els.echoInDate.timeFormatter =
            _els.echoInPopover.timeFormatter =
                fn;
    }
    /** 年月日回显格式化函数。设置为 `null` 则重置为默认值 */
    public get dateFormatter(): DateFormatterFn {
        return this._els.dateSelector.dateFormatter;
    }
    public set dateFormatter(fn: DateFormatterFn | null) {
        const { _els } = this;
        _els.echoInDate.dateFormatter = _els.echoInPopover.dateFormatter = fn;
    }
    /** 日期时间回显格式化函数。设置为 `null` 则重置为默认值 */
    public get dateTimeFormatter(): DatetimeFormatterFn {
        return this._els.echoInDate.dateTimeFormatter;
    }
    public set dateTimeFormatter(fn: DatetimeFormatterFn | null) {
        const { _els } = this;
        _els.echoInDate.dateTimeFormatter =
            _els.echoInPopover.dateTimeFormatter = fn;
    }
}

Ele.define();
