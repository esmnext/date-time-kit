import { closestByEvent, debounce, smallScreenObserver } from '../../utils';
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
     * 例如设置为 'minute'，则表示只能选择到分钟，秒和毫秒将被忽略。
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

    protected _style = styleStr;
    protected _template = html;

    constructor() {
        super();
        this._applyTemplate();
    }

    private get _startNavEle() {
        return this.shadowRoot?.querySelector(
            '.start dt-yyyymm-nav'
        ) as YyyyMmNavEle;
    }
    private get _endNavEle() {
        return this.shadowRoot?.querySelector(
            '.end dt-yyyymm-nav'
        ) as YyyyMmNavEle;
    }
    private get _startCalendar() {
        return this.shadowRoot?.querySelector(
            '.start dt-calendar-base'
        ) as CalendarBaseEle;
    }
    private get _endCalendar() {
        return this.shadowRoot?.querySelector(
            '.end dt-calendar-base'
        ) as CalendarBaseEle;
    }
    private get _startTimeSelector() {
        return this.shadowRoot?.querySelector(
            'dt-hhmmss-ms-selector[data-type="start"]'
        ) as HhMmSsMsSelectorEle;
    }
    private get _endTimeSelector() {
        return this.shadowRoot?.querySelector(
            'dt-hhmmss-ms-selector[data-type="end"]'
        ) as HhMmSsMsSelectorEle;
    }

    // 存放的是结束时间点
    private _selectedDate: Date | null = null;

    public connectedCallback() {
        if (!super.connectedCallback()) return;
        this._selectedDate = null;
        this._startCalendar.formatter = this._endCalendar.formatter = (
            i: number
        ) => String(i).padStart(2, '0');
        this._render();
        this._startCalendar.addEventListener(
            'select-time',
            this._onCalendarSelect
        );
        this._endCalendar.addEventListener(
            'select-time',
            this._onCalendarSelect
        );
        this._startNavEle.addEventListener('change', this._onNavChange);
        this._endNavEle.addEventListener('change', this._onNavChange);
        this._startCalendar.addEventListener(
            'hover-item',
            this._onCalendarItemHover
        );
        this._endCalendar.addEventListener(
            'hover-item',
            this._onCalendarItemHover
        );
        this._startNavEle.addEventListener(
            'popover-open-change',
            this._onNavOpenToggle
        );
        this._endNavEle.addEventListener(
            'popover-open-change',
            this._onNavOpenToggle
        );
        this._startTimeSelector.addEventListener(
            'open-change',
            this._stopEvent
        );
        this._endTimeSelector.addEventListener('open-change', this._stopEvent);
        this._startTimeSelector.addEventListener(
            'select-time',
            this._onTimeSelectorChange
        );
        this._endTimeSelector.addEventListener(
            'select-time',
            this._onTimeSelectorChange
        );
        smallScreenObserver.observe(this, this._render);
    }
    public disconnectedCallback() {
        if (!super.disconnectedCallback()) return;
        this._startCalendar.removeEventListener(
            'select-time',
            this._onCalendarSelect
        );
        this._endCalendar.removeEventListener(
            'select-time',
            this._onCalendarSelect
        );
        this._startNavEle.removeEventListener('change', this._onNavChange);
        this._endNavEle.removeEventListener('change', this._onNavChange);
        this._startCalendar.removeEventListener(
            'hover-item',
            this._onCalendarItemHover
        );
        this._endCalendar.removeEventListener(
            'hover-item',
            this._onCalendarItemHover
        );
        this._startNavEle.removeEventListener(
            'popover-open-change',
            this._onNavOpenToggle
        );
        this._endNavEle.removeEventListener(
            'popover-open-change',
            this._onNavOpenToggle
        );
        this._startTimeSelector.removeEventListener(
            'open-change',
            this._stopEvent
        );
        this._endTimeSelector.removeEventListener(
            'open-change',
            this._stopEvent
        );
        this._startTimeSelector.removeEventListener(
            'select-time',
            this._onTimeSelectorChange
        );
        this._endTimeSelector.removeEventListener(
            'select-time',
            this._onTimeSelectorChange
        );
        smallScreenObserver.unobserve(this);
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
        const timeStart = new Date(this._startNavEle.millisecond);
        const timeEnd = new Date(this._endNavEle.millisecond);
        const showCtrlBtn = diffInMonth(timeStart, timeEnd) > 1;
        const isSmall = smallScreenObserver.isSmall;
        this._startNavEle.showCtrlBtnMonthAdd = isSmall || showCtrlBtn;
        this._endNavEle.showCtrlBtnMonthSub = isSmall || showCtrlBtn;
    }

    private _render = debounce(() => {
        if (!this.isConnected) return;
        let timeStart = this.timeStart as Date;
        let timeEnd = this.timeEnd as Date;
        if (timeStart > timeEnd) [timeStart, timeEnd] = [timeEnd, timeStart];
        const { _startCalendar, _endCalendar } = this;
        _startCalendar.weekStartAt = _endCalendar.weekStartAt =
            this.weekStartAt;
        _startCalendar.timeStart = _endCalendar.timeStart = +timeStart;
        _endCalendar.timeEnd = _startCalendar.timeEnd = +timeEnd;
        const isSmall = smallScreenObserver.isSmall;
        if (
            !isSmall ||
            !this._selectedDate ||
            +timeStart !== +this._selectedDate
        ) {
            this._startNavEle.millisecond = _startCalendar.showingTime =
                +timeStart;
        } else {
            this._startNavEle.millisecond = _startCalendar.showingTime =
                +timeEnd;
        }
        if (diffInMonth(timeStart, timeEnd) <= 1) {
            const nextMonth = new Date(
                timeStart.getFullYear(),
                timeStart.getMonth() + 1
            );
            this._endCalendar.showingTime = nextMonth;
            this._endNavEle.millisecond = +nextMonth;
        } else {
            this._endCalendar.showingTime = timeEnd;
            this._endNavEle.millisecond = +timeEnd;
        }
        if (this.minGranularity === 'day') {
            this._startTimeSelector.style.display = 'none';
            this._endTimeSelector.style.display = 'none';
        } else {
            this._startTimeSelector.style.display = '';
            this._endTimeSelector.style.display = '';
            this._startTimeSelector.currentTime = timeStart;
            this._endTimeSelector.currentTime = timeEnd;
            this._startTimeSelector.minGranularity = this.minGranularity;
            this._endTimeSelector.minGranularity = this.minGranularity;
        }
        this._updateDateEcho();
        this._updateNavCtrlBtn();
        const startSelectorWrapper = this.shadowRoot!.querySelector(
            '.start .time-selector-wrapper'
        ) as HTMLElement;
        const dividingLine = startSelectorWrapper.querySelector(
            '.dividing-line'
        ) as HTMLElement;
        if (smallScreenObserver.isSmall) {
            startSelectorWrapper.appendChild(this._endTimeSelector);
            dividingLine.style.display = '';
        } else {
            (
                this.shadowRoot!.querySelector(
                    '.end .time-selector-wrapper'
                ) as HTMLElement
            ).appendChild(this._endTimeSelector);
            dividingLine.style.display = 'none';
        }
    }, 0);

    private _updateDateEcho() {
        let timeStart = this.timeStart as Date;
        let timeEnd = this.timeEnd as Date;
        if (timeStart > timeEnd) [timeStart, timeEnd] = [timeEnd, timeStart];
        const isSmall = smallScreenObserver.isSmall;
        this.shadowRoot!.querySelector('.start-date-echo')!.textContent =
            this.dateFormatter(timeStart, this.minGranularity, isSmall);
        this.shadowRoot!.querySelector('.end-date-echo')!.textContent =
            this.dateFormatter(timeEnd, this.minGranularity, isSmall);
        this.shadowRoot!.querySelector(
            '.start-date-echo-wrapper'
        )!.classList.toggle('active', !this._selectedDate);
        this.shadowRoot!.querySelector(
            '.end-date-echo-wrapper'
        )!.classList.toggle('active', !!this._selectedDate);
    }

    private _updateDatePoint = (datePoint: Date) => {
        if (!this._selectedDate) return;
        const newDate = new Date(datePoint).setHours(0, 0, 0, 0);
        const oldDate = new Date(this._selectedDate).setHours(0, 0, 0, 0);
        const setStartDate = (date: number) =>
            (this.timeStart = new Date(
                date + this._startTimeSelector.millisecond
            ));
        const setEndDate = (date: number) =>
            (this.timeEnd = new Date(date + this._endTimeSelector.millisecond));
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
                +e.detail + this._startTimeSelector.millisecond
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
            this._startCalendar.showingTime = +newTime;
        } else {
            this._endCalendar.showingTime = +newTime;
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
        return this._startTimeSelector.timeFormatter;
    }
    public set timeFormatter(fn: (
        time: Date,
        minGranularity: TimeGranularity
    ) => string) {
        if (typeof fn !== 'function') return;
        this._startTimeSelector.timeFormatter = fn;
        this._endTimeSelector.timeFormatter = fn;
    }
}

Ele.define();
