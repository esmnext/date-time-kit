import { closestByEvent, debounce, html } from "@/utils";
import { BaseAttrs, DefEle, UiBase } from "@/components/web-component-base";
import styleStr from './index.scss?inline';
import DateNavEle, { DateNavEmit } from "./date-nav";
import CalendarBaseEle, { CalendarBaseEmit } from "../calendar";
import HhMmSsMsListGrpEle from "../hhmmss-ms-list-grp";
import Popover, { PopoverEmit } from "../popover";

export interface PeriodSelectorAttrs extends BaseAttrs {
    /**
     * The start time of the calendar display range.
     * @type {`string | number`} A value that can be passed to the Date constructor.
     * @default 'current-time'
     */
    'time-start': string | number;
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
    'min-granularity'?: 'day' | 'hour' | 'minute' | 'second' | 'millisecond';
}

export interface PeriodSelectorEmit {
    'change': {
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
    return (bYear * 12 + bMonth) - (aYear * 12 + aMonth);
};

/**
 * 时间段选择器（两个日历）
 *
 * 存在一个 timeFormatter 方法，可以重写该方法以自定义时分秒毫秒的回显格式。
 */
@DefEle('period-selector')
export default class PeriodSelector extends UiBase<PeriodSelectorAttrs, PeriodSelectorEmit> {
    static get observedAttributes(): string[] {
        return [
            ...(super.observedAttributes as (keyof BaseAttrs)[]),
            'time-start',
            'time-end',
            'min-granularity',
        ] satisfies (keyof PeriodSelectorAttrs)[];
    }

    public get timeStart() {
        const v = this._getAttr('time-start', '');
        return new Date(Number.isNaN(+v) ? v: +v);
    }
    public set timeStart(val: number | string | Date) {
        const v = new Date(val);
        if (Number.isNaN(+v)) return;
        this.setAttribute('time-start', +v + '');
    }
    public get timeEnd() {
        const v = this._getAttr('time-end', '');
        return new Date(Number.isNaN(+v) ? v: +v);
    }
    public set timeEnd(val: number | string | Date) {
        const v = new Date(val);
        if (Number.isNaN(+v)) return;
        this.setAttribute('time-end', +v + '');
    }

    protected _style = styleStr;
    protected _template = html`
<div class="date-echo">
    <div class="start-date-echo-wrapper active">
        <span class="label">Start Date</span>
        <span class="start-date-echo">dd/mm/yyyy</span>
    </div>
    <i class="dividing-line"></i>
    <div class="end-date-echo-wrapper">
        <span class="label">End Date</span>
        <span class="end-date-echo">dd/mm/yyyy</span>
    </div>
</div><div class="calendars">${['start', 'end'].map(s => html`
<div class="wrapper ${s}">
    <dt-date-nav
        show-ctrl-btn-month-add
        show-ctrl-btn-month-sub
    ></dt-date-nav>
    <dt-calendar-base data-type="${s}"></dt-calendar-base>
    <dt-popover>
        <div slot="trigger" class="time-echo-wrapper">
            <i class="time-icon"></i>
            <span class="time-echo">hh:mm:ss.sss</span>
        </div>
        <div slot="pop" class="time-selector">
            <h3 class="title">${s === 'start' ? 'Start Time' : 'End Time'}</h3>
            <dt-hhmmss-ms-list-grp></dt-hhmmss-ms-list-grp>
            <button id="time-selector-done-btn" data-type="${s}">Done</button>
        </div>
    </dt-popover>
</div>`).join('')}</div>`;

    constructor() {
        super();
        this._applyTemplate();
    }

    private get _startNavEle() {
        return this.shadowRoot?.querySelector('.start dt-date-nav') as DateNavEle;
    }
    private get _endNavEle() {
        return this.shadowRoot?.querySelector('.end dt-date-nav') as DateNavEle;
    }
    private get _startCalendar() {
        return this.shadowRoot?.querySelector('.start dt-calendar-base') as CalendarBaseEle;
    }
    private get _endCalendar() {
        return this.shadowRoot?.querySelector('.end dt-calendar-base') as CalendarBaseEle;
    }
    private get _startTimeSelector() {
        return this.shadowRoot?.querySelector('.start dt-hhmmss-ms-list-grp') as HhMmSsMsListGrpEle;
    }
    private get _endTimeSelector() {
        return this.shadowRoot?.querySelector('.end dt-hhmmss-ms-list-grp') as HhMmSsMsListGrpEle;
    }
    private get _startTimePopover() {
        return this.shadowRoot?.querySelector('.start dt-popover') as Popover;
    }
    private get _endTimePopover() {
        return this.shadowRoot?.querySelector('.end dt-popover') as Popover;
    }

    // 存放的是结束时间点
    private _selectedDate: Date | null = null;

    public connectedCallback() {
        if (!super.connectedCallback()) return;
        this._selectedDate = null;
        this._startCalendar.formatter = this._endCalendar.formatter =
            (i: number) => String(i).padStart(2, '0');
        this._render();
        this._startCalendar.addEventListener('select-time', this._onCalendarSelect);
        this._endCalendar.addEventListener('select-time', this._onCalendarSelect);
        this._startNavEle.addEventListener('change', this._onNavChange);
        this._endNavEle.addEventListener('change', this._onNavChange);
        this._startTimePopover.addEventListener('open-change', this._onTimePopoverOpenChange);
        this._endTimePopover.addEventListener('open-change', this._onTimePopoverOpenChange);
        this._startCalendar.addEventListener('hover-item', this._onCalendarItemHover);
        this._endCalendar.addEventListener('hover-item', this._onCalendarItemHover);
        this.shadowRoot?.querySelectorAll('#time-selector-done-btn').forEach(btn => {
            btn.addEventListener('click', this._onTimeSelectorDoneClick);
        });
    }
    public disconnectedCallback() {
        if (!super.disconnectedCallback()) return;
        this._startCalendar.removeEventListener('select-time', this._onCalendarSelect);
        this._endCalendar.removeEventListener('select-time', this._onCalendarSelect);
        this._startNavEle.removeEventListener('change', this._onNavChange);
        this._endNavEle.removeEventListener('change', this._onNavChange);
        this._startTimePopover.removeEventListener('open-change', this._onTimePopoverOpenChange);
        this._endTimePopover.removeEventListener('open-change', this._onTimePopoverOpenChange);
        this._startCalendar.removeEventListener('hover-item', this._onCalendarItemHover);
        this._endCalendar.removeEventListener('hover-item', this._onCalendarItemHover);
        this.shadowRoot?.querySelectorAll('#time-selector-done-btn').forEach(btn => {
            btn.removeEventListener('click', this._onTimeSelectorDoneClick);
        });
    }

    protected _onAttrChanged(name: string, oldValue: string, newValue: string) {
        super._onAttrChanged(name, oldValue, newValue);
        this._render();
    }

    private _updateNavCtrlBtn() {
        const timeStart = new Date(this._startNavEle.millisecond),
            timeEnd = new Date(this._endNavEle.millisecond);
        const showCtrlBtn = diffInMonth(timeStart, timeEnd) > 1;
        this._startNavEle.showCtrlBtnMonthAdd = showCtrlBtn;
        this._endNavEle.showCtrlBtnMonthSub = showCtrlBtn;
    }

    private _render = debounce(() => {
        if (!this.isConnected) return;
        let timeStart = this.timeStart as Date, timeEnd = this.timeEnd as Date;
        if (timeStart > timeEnd) [timeStart, timeEnd] = [timeEnd, timeStart];
        const tz = new Date().getTimezoneOffset() * 60 * 1000;
        this._startNavEle.millisecond =
            this._startCalendar.showingTime =
            this._startCalendar.timeStart =
            this._endCalendar.timeStart = +timeStart;
        this._startTimeSelector.millisecond = (+timeStart - tz) % (24 * 60 * 60 * 1000);
        this._endCalendar.timeEnd =
            this._startCalendar.timeEnd = +timeEnd;
        if (diffInMonth(timeStart, timeEnd) <= 1) {
            const nextMonth = new Date(timeStart.getFullYear(), timeStart.getMonth() + 1);
            this._endCalendar.showingTime = nextMonth;
            this._endNavEle.millisecond = +nextMonth;
        } else {
            this._endCalendar.showingTime = timeEnd;
            this._endNavEle.millisecond = +timeEnd;
        }
        this._endTimeSelector.millisecond = (+timeEnd - tz) % (24 * 60 * 60 * 1000);
        this.shadowRoot!.querySelector('.wrapper.start .time-echo')!.textContent =
            this.timeFormatter(timeStart as Date);
        this.shadowRoot!.querySelector('.wrapper.end .time-echo')!.textContent =
            this.timeFormatter(timeEnd as Date);
        this._updateDateEcho();
        this._updateNavCtrlBtn();
    }, 0);

    private _updateDateEcho() {
        let timeStart = this.timeStart as Date, timeEnd = this.timeEnd as Date;
        if (timeStart > timeEnd) [timeStart, timeEnd] = [timeEnd, timeStart];
        this.shadowRoot!.querySelector('.start-date-echo')!.textContent = this.dateFormatter(timeStart);
        this.shadowRoot!.querySelector('.end-date-echo')!.textContent = this.dateFormatter(timeEnd);
        this.shadowRoot!.querySelector('.start-date-echo-wrapper')!.classList.toggle('active', !this._selectedDate);
        this.shadowRoot!.querySelector('.end-date-echo-wrapper')!.classList.toggle('active', !!this._selectedDate);
    }

    private _onCalendarSelect = (e: CustomEvent<CalendarBaseEmit['select-time']>) => {
        if (this._selectedDate) {
            this._selectedDate = null;
            this.timeEnd = +e.detail + this._endTimeSelector.millisecond;
        } else {
            this._selectedDate = this.timeEnd as unknown as Date;
            this.timeStart = +e.detail + this._startTimeSelector.millisecond;
        }
        this._updateDateEcho();
    };
    private _onCalendarItemHover = (e: CustomEvent<CalendarBaseEmit['hover-item']>) => {
        if (!this._selectedDate) return;
        this.timeEnd = +e.detail + this._endTimeSelector.millisecond;
    };
    private _onNavChange = (e: CustomEvent<DateNavEmit['change']>) => {
        const wrapper = closestByEvent(e, '.wrapper');
        if (!wrapper) return;
        const { newStartTime, newEndTime } = e.detail;
        if (wrapper.classList.contains('start')) {
            this._startCalendar.showingTime = +newStartTime;
        } else {
            this._endCalendar.showingTime = +newEndTime;
        }
        this._updateNavCtrlBtn();
    };
    private _onTimePopoverOpenChange = (e: CustomEvent<PopoverEmit['open-change']>) => {
        if (!(e.target instanceof Popover)) return;
        if (!e.detail) return this._render(); // for reset time selector value
        e.target.querySelectorAll<HhMmSsMsListGrpEle>('dt-hhmmss-ms-list-grp').forEach(ele => {
            ele.scrollToCurrentItem();
        });
    };
    private _onTimeSelectorDoneClick = (e: Event) => {
        const btn = closestByEvent(e, '#time-selector-done-btn');
        if (!btn) return;
        const type = btn.dataset.type;
        const calcTime = (time: Date, ms: number) => {
            time.setHours(0, 0, 0, 0);
            time.setMilliseconds(ms);
            return time;
        };
        if (type === 'start') {
            this.timeStart = calcTime(this.timeStart as Date, this._startTimeSelector.millisecond);
            this._startTimePopover.open = false;
        } else if (type === 'end') {
            this.timeEnd = calcTime(this.timeEnd as Date, this._endTimeSelector.millisecond);
            this._endTimePopover.open = false;
        }
    };

    public timeFormatter = (time: Date) =>
        new Date(+time - new Date().getTimezoneOffset() * 60 * 1000).toISOString().slice(11, 23);
    public dateFormatter = (time: Date) =>
        time.toLocaleDateString('en-GB');
}
