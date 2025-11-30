import { closestByEvent } from '../../utils';
import {
    type Ele as CalendarBaseEle,
    type EventMap as CalendarBaseEvent,
    type Weeks,
    weekKey
} from '../calendar';
import {
    Ele as HhMmSsMsSelectorEle,
    type EventMap as HhMmSsMsSelectorEvent,
    type Granularity as TimeGranularity,
    granularityList as timeGranularityList
} from '../hhmmss-ms-list-grp/selector';
import { Ele as PopoverEle, type EventMap as PopoverEvent } from '../popover';
import { type BaseAttrs, type BaseEmits, UiBase } from '../web-component-base';
import {
    Ele as YyyyMmNavEle,
    type EventMap as YyyyMmNavEvent
} from '../yyyymm-nav';
import styleStr from './index.css';
import html from './index.html';

export const granularityList = ['day', ...timeGranularityList] as const;
export type Granularity = (typeof granularityList)[number];

export interface Attrs extends BaseAttrs {
    /**
     * The start time of the calendar display range.
     * @type {`string | number`} A value that can be passed to the Date constructor.
     * @default Date.now()
     */
    'time-start'?: string | number;
    /**
     * The end time of the calendar display range.
     * @type {`string | number`} A value that can be passed to the Date constructor.
     * @default 'time-start'
     */
    'time-end': string | number;
    /**
     * 选择器的粒度，表示最小可选的时间单位。默认为 millisecond。
     * 例如设置为 'minute'，则表示只能选择到分钟，秒和毫秒将被忽略。忽略的时间单位视情况重置为 0 或 23 或 59 或 999。
     */
    'min-granularity'?: Granularity;
    /**
     * Set which day of the week is the first day.
     * @type `'sun' | 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat'`
     * @default 'sun'
     */
    'week-start-at'?: Weeks;
}

export interface Emits extends BaseEmits {
    change: {
        oldStartTime: Date;
        oldEndTime: Date;
        newStartTime: Date;
        newEndTime: Date;
    };
}

const diffInMonth = (a: Date, b: Date) => {
    if (a > b) [a, b] = [b, a];
    const aYear = a.getFullYear();
    const aMonth = a.getMonth();
    const bYear = b.getFullYear();
    const bMonth = b.getMonth();
    return bYear * 12 + bMonth - (aYear * 12 + aMonth);
};

/**
 * 时间段选择器（两个日历）
 *
 * 存在一个 timeFormatter 方法，可以重写该方法以自定义时分秒毫秒的回显格式。
 */
export class Ele extends UiBase<Attrs, Emits> {
    public static readonly tagName = 'dt-period-selector' as const;
    protected static _style = styleStr;
    protected static _template = html;

    static get observedAttributes(): string[] {
        return [
            ...(super.observedAttributes as (keyof BaseAttrs)[]),
            'time-start',
            'time-end',
            'min-granularity',
            'week-start-at'
        ] satisfies (keyof Attrs)[];
    }

    public get timeStart() {
        const v = this._getAttr('time-start', '' + Date.now());
        return new Date(Number.isNaN(+v) ? v : +v);
    }
    public set timeStart(val: number | string | Date) {
        const v = new Date(val);
        if (Number.isNaN(+v)) return;
        this.setAttribute('time-start', +v + '');
    }
    public get timeEnd() {
        const v = this._getAttr('time-end', '' + this.timeStart);
        return new Date(Number.isNaN(+v) ? v : +v);
    }
    public set timeEnd(val: number | string | Date) {
        const v = new Date(val);
        if (Number.isNaN(+v)) return;
        this.setAttribute('time-end', +v + '');
    }
    public get weekStartAt() {
        return this._getAttr('week-start-at', 'sun');
    }
    public set weekStartAt(val: Weeks) {
        if (!weekKey.includes(val)) return;
        this.setAttribute('week-start-at', val);
    }
    public get minGranularity() {
        return this._getAttr('min-granularity', 'millisecond');
    }
    public set minGranularity(val: Granularity) {
        if (!granularityList.includes(val)) return;
        this.setAttribute('min-granularity', val);
    }

    get _staticEls() {
        return {
            ...super._staticEls,
            allNav: this.$<YyyyMmNavEle>`dt-yyyymm-nav`!,
            startNav: this.$0<YyyyMmNavEle>`.start dt-yyyymm-nav`!,
            endNav: this.$0<YyyyMmNavEle>`.end dt-yyyymm-nav`!,
            calendars: this.$<CalendarBaseEle>`dt-calendar-base`!,
            startCalendar: this.$0<CalendarBaseEle>`.start dt-calendar-base`!,
            endCalendar: this.$0<CalendarBaseEle>`.end dt-calendar-base`!,
            timeSelectors: this.$<HhMmSsMsSelectorEle>`dt-hhmmss-ms-selector`!,
            startTimeSelector: this
                .$0<HhMmSsMsSelectorEle>`.start dt-hhmmss-ms-selector`!,
            endTimeSelector: this
                .$0<HhMmSsMsSelectorEle>`.end dt-hhmmss-ms-selector`!
        } as const;
    }

    // 存放的是结束时间点
    private _selectedDate: Date | null = null;

    public connectedCallback() {
        if (!super.connectedCallback()) return;
        const { _els } = this;
        this._selectedDate = null;
        _els.calendars.forEach(
            (c) => (c.formatter = (i) => ('' + i).padStart(2, '0'))
        );
        this._render();

        this._bindEvt(_els.allNav)('change', this._onNavChange);
        this._bindEvt(_els.allNav)(
            'popover-open-change',
            this._onNavOpenToggle
        );
        this._bindEvt(_els.calendars)('select-time', this._onCalendarSelect);
        this._bindEvt(_els.calendars)('hover-item', this._onCalendarItemHover);
        this._bindEvt(_els.timeSelectors)('open-change', this._stopEvent);
        this._bindEvt(_els.timeSelectors)(
            'select-time',
            this._onTimeSelectorChange
        );
    }

    protected _onScreenSizeChanged(isSmall: boolean) {
        super._onScreenSizeChanged(isSmall);
        this._render();
    }

    protected _onAttrChanged(
        name: string,
        oldValue: string | null,
        newValue: string | null
    ) {
        super._onAttrChanged(name, oldValue, newValue);
        this._render();
    }

    private _updateNavCtrlBtn() {
        const { _els } = this;
        const timeStart = new Date(_els.startNav.millisecond);
        const timeEnd = new Date(_els.endNav.millisecond);
        const showCtrlBtn = diffInMonth(timeStart, timeEnd) > 1;
        const isSmall = this._isSmallScreen;
        _els.startNav.showCtrlBtnMonthAdd = _els.endNav.showCtrlBtnMonthSub =
            isSmall || showCtrlBtn;
    }

    private _render = super._genRenderFn(() => {
        let timeStart = this.timeStart as Date;
        let timeEnd = this.timeEnd as Date;
        if (timeStart > timeEnd) [timeStart, timeEnd] = [timeEnd, timeStart];
        const { _els } = this;
        _els.startCalendar.weekStartAt = _els.endCalendar.weekStartAt =
            this.weekStartAt;
        _els.startCalendar.timeStart = _els.endCalendar.timeStart = +timeStart;
        _els.endCalendar.timeEnd = _els.startCalendar.timeEnd = +timeEnd;
        const isSmall = this._isSmallScreen;
        _els.startNav.millisecond = _els.startCalendar.showingTime =
            !isSmall ||
            !this._selectedDate ||
            +timeStart !== +this._selectedDate
                ? +timeStart
                : +timeEnd;
        if (diffInMonth(timeStart, timeEnd) <= 1) {
            const nextMonth = new Date(
                timeStart.getFullYear(),
                timeStart.getMonth() + 1
            );
            _els.endCalendar.showingTime = nextMonth;
            _els.endNav.millisecond = +nextMonth;
        } else {
            _els.endCalendar.showingTime = timeEnd;
            _els.endNav.millisecond = +timeEnd;
        }
        if (this.minGranularity === 'day') {
            _els.timeSelectors.forEach((e) => (e.style.display = 'none'));
        } else {
            _els.timeSelectors.forEach((e) => (e.style.display = ''));
            _els.startTimeSelector.currentTime = timeStart;
            _els.endTimeSelector.currentTime = timeEnd;
            _els.startTimeSelector.minGranularity =
                _els.endTimeSelector.minGranularity = this.minGranularity;
        }
        this._updateDateEcho();
        this._updateNavCtrlBtn();
        const dividingLine = this.$0`.start .dividing-line`!;
        if (this._isSmallScreen) {
            this.$0`.start .time-selector-wrapper`!.appendChild(
                this._els.endTimeSelector
            );
            dividingLine.style.display = '';
        } else {
            this.$0`.end .time-selector-wrapper`!.appendChild(
                this._els.endTimeSelector
            );
            dividingLine.style.display = 'none';
        }
    });

    private _updateDateEcho() {
        let timeStart = this.timeStart as Date;
        let timeEnd = this.timeEnd as Date;
        if (timeStart > timeEnd) [timeStart, timeEnd] = [timeEnd, timeStart];
        const isSmall = this._isSmallScreen;
        this.$0`.start-date-echo`!.textContent = this.dateFormatter(
            timeStart,
            this.minGranularity,
            isSmall
        );
        this.$0`.end-date-echo`!.textContent = this.dateFormatter(
            timeEnd,
            this.minGranularity,
            isSmall
        );
        this.$0`.start-date-echo-wrapper`!.classList.toggle(
            'active',
            !this._selectedDate
        );
        this.$0`.end-date-echo-wrapper`!.classList.toggle(
            'active',
            !!this._selectedDate
        );
    }

    private _getTimeSelectorMs(type: 'start' | 'end') {
        const selector =
            type === 'start'
                ? this._els.startTimeSelector
                : this._els.endTimeSelector;
        return this.minGranularity === 'day'
            ? type === 'start'
                ? 0
                : 86399999 // 23:59:59.999
            : selector.millisecond;
    }

    private _updateDatePoint = (datePoint: Date) => {
        if (!this._selectedDate) return;
        const newDate = new Date(datePoint).setHours(0, 0, 0, 0);
        const oldDate = new Date(this._selectedDate).setHours(0, 0, 0, 0);
        const setStartDate = (date: number) =>
            (this.timeStart = new Date(
                date + this._getTimeSelectorMs('start')
            ));
        const setEndDate = (date: number) =>
            (this.timeEnd = new Date(date + this._getTimeSelectorMs('end')));
        if (newDate === oldDate) {
            setStartDate(newDate);
            setEndDate(newDate);
        } else if (newDate < oldDate) {
            setStartDate(newDate);
            setEndDate(oldDate);
        } else {
            setStartDate(oldDate);
            setEndDate(newDate);
        }
    };
    private _onCalendarSelect = (e: CalendarBaseEvent['select-time']) => {
        e.stopPropagation();
        if (this._selectedDate === null) {
            const newTimePoint = new Date(
                +e.detail + this._getTimeSelectorMs('start')
            );
            this._selectedDate = newTimePoint;
            this.timeStart = newTimePoint;
        } else {
            this._updateDatePoint(e.detail);
            this._selectedDate = null;
        }
    };
    private _onCalendarItemHover = (e: CalendarBaseEvent['hover-item']) => {
        e.stopPropagation();
        this._updateDatePoint(e.detail);
    };
    public abortSelecting() {
        if (!this._selectedDate) return;
        this._selectedDate = null;
        this._render();
    }
    private _onNavChange = (e: YyyyMmNavEvent['change']) => {
        e.stopPropagation();
        const wrapper = closestByEvent(e, '.wrapper');
        if (!wrapper) return;
        const { newTime } = e.detail;
        if (wrapper.classList.contains('start')) {
            this._els.startCalendar.showingTime = +newTime;
        } else {
            this._els.endCalendar.showingTime = +newTime;
        }
        this._updateNavCtrlBtn();
    };
    private _onNavOpenToggle = (e: YyyyMmNavEvent['popover-open-change']) => {
        if (!(e.target instanceof YyyyMmNavEle)) return;
        e.stopPropagation();
        e.target.nextElementSibling?.classList.toggle('hide', e.detail);
    };
    private _onTimeSelectorChange = (
        e: HhMmSsMsSelectorEvent['select-time']
    ) => {
        if (!(e.target instanceof HhMmSsMsSelectorEle)) return;
        e.stopPropagation();
        const type = e.target.dataset.type;
        if (type === 'start') {
            this.timeStart = e.detail;
        } else if (type === 'end') {
            this.timeEnd = e.detail;
        }
    };

    public showCalendarDatePoint() {
        this._render();
    }

    public dateFormatter = (
        time: Date,
        minGranularity: Granularity,
        isSmall: boolean
    ) => time.toLocaleDateString('en-GB');
    // + (isSmall && minGranularity !== 'day'
    //     ? ' ' + this.timeFormatter(time, minGranularity)
    //     : '');

    public get timeFormatter() {
        return this._els.startTimeSelector.timeFormatter;
    }
    public set timeFormatter(fn: HhMmSsMsSelectorEle['timeFormatter']) {
        if (typeof fn !== 'function') return;
        this._els.startTimeSelector.timeFormatter = fn;
        this._els.endTimeSelector.timeFormatter = fn;
    }
}

Ele.define();
