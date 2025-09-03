import { closestByEvent, css, debounce, html } from '../../utils';
import { type BaseAttrs, UiBase } from '../web-component-base';
// import styleStr from './index.scss?inline';
const styleStr = css`
:host {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.date-echo {
  display: flex;
  gap: 5px;
  align-items: center;
}

.start-date-echo-wrapper,
.end-date-echo-wrapper {
  width: 100%;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
  border-radius: 6px;
  border: 1px solid rgba(0, 0, 0, 0.1490196078);
  padding: 4px;
}
.start-date-echo-wrapper.active,
.end-date-echo-wrapper.active {
  border-color: #333;
}

.date-echo .label {
  font-size: 14px;
  line-height: 1;
}

.start-date-echo, .end-date-echo {
  font-size: 16px;
  line-height: 1;
  font-weight: bold;
}

.dividing-line {
  display: block;
  height: 1px;
  width: 20px;
  background-color: #eee;
}

dt-yyyymm-nav::part(list-grp) {
  height: 254px;
  margin-top: 15px;
}

dt-calendar-base.hide {
  display: none;
}

.calendars {
  display: flex;
  gap: 20px;
}

.wrapper {
  flex: 1;
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 15px;
}

dt-popover {
  position: relative;
}

[open] .time-echo-wrapper {
  border-color: #18181B;
}

.time-echo-wrapper {
  width: 100%;
  padding: 4px;
  display: flex;
  gap: 5px;
  border-radius: 4px;
  min-height: 30px;
  border: 1px solid rgba(0, 0, 0, 0.0666666667);
  box-sizing: border-box;
  align-items: center;
  cursor: pointer;
}

.time-selector {
  position: absolute;
  width: 100%;
  height: 461px;
  box-sizing: border-box;
  background-color: #fff;
  display: flex;
  flex-direction: column;
  gap: 15px;
  padding: 15px;
  border-radius: 6px;
  border: 1px solid #eee;
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
}
.time-selector .title {
  font-size: 16px;
  margin: 0;
  line-height: 1;
}

dt-hhmmss-ms-list-grp::part(list-container) {
  gap: 2px;
}
dt-hhmmss-ms-list-grp::part(list) {
  scroll-behavior: smooth;
}
dt-hhmmss-ms-list-grp::part(item) {
  font-size: 14px;
  line-height: 17px;
}

#time-selector-done-btn {
  border: none;
  min-height: 30px;
  border-radius: 6px;
  padding: 5px 10px;
  font-size: 14px;
  background-color: #18181B;
  color: #fff;
}

.time-icon {
  display: inline-block;
  width: 20px;
  height: 20px;
  background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='14' height='15' fill='currentColor'%3E%3Cpath d='M7.4335 4.241a.4376.4376 0 0 0-.871.0594v3.783l.0044.0622a.4375.4375 0 0 0 .1921.3029L8.9242 9.877l.0566.0317a.4376.4376 0 0 0 .5495-.1559l.0317-.0566a.4376.4376 0 0 0-.1559-.5495L7.4375 7.8471V4.3004l-.004-.0593ZM7 1.6667c-3.2217 0-5.8333 2.6116-5.8333 5.8333 0 3.2217 2.6116 5.8333 5.8333 5.8333 3.2217 0 5.8333-2.6116 5.8333-5.8333 0-3.2217-2.6116-5.8333-5.8333-5.8333Zm0 .814c2.7721 0 5.0194 2.2472 5.0194 5.0193 0 2.7721-2.2473 5.0194-5.0194 5.0194S1.9806 10.2721 1.9806 7.5 4.228 2.4806 7 2.4806Z'/%3E%3C/svg%3E") 50%/20px 20px no-repeat;
}

.time-echo {
  font-size: 14px;
  color: #999;
  line-height: 1;
}

dt-calendar-base {
  height: 254px;
}
dt-calendar-base::part(week) {
  font-size: 12px;
  line-height: 14px;
}
dt-calendar-base::part(item) {
  font-size: 14px;
}
`;
import {
    Ele as YyyyMmNavEle,
    type EventMap as YyyyMmNavEvent
} from '../yyyymm-nav';
YyyyMmNavEle.define();
import {
    Ele as CalendarBaseEle,
    type EventMap as CalendarBaseEvent,
    type Weeks,
    weekKey
} from '../calendar';
CalendarBaseEle.define();
import { Ele as HhMmSsMsListGrpEle } from '../hhmmss-ms-list-grp';
HhMmSsMsListGrpEle.define();
import { Ele as PopoverEle, type EventMap as PopoverEvent } from '../popover';
PopoverEle.define();

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
    'min-granularity'?: 'day' | 'hour' | 'minute' | 'second' | 'millisecond';
    /**
     * Set which day of the week is the first day.
     * @type `'sun' | 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat'`
     * @default 'sun'
     */
    'week-start-at'?: Weeks;
}

export interface Emits {
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
</div><div class="calendars">${['start', 'end']
        .map(
            (s) => html`
<div class="wrapper ${s}">
    <dt-yyyymm-nav
        show-ctrl-btn-month-add
        show-ctrl-btn-month-sub
    ></dt-yyyymm-nav>
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
</div>`
        )
        .join('')}</div>`;

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
            '.start dt-hhmmss-ms-list-grp'
        ) as HhMmSsMsListGrpEle;
    }
    private get _endTimeSelector() {
        return this.shadowRoot?.querySelector(
            '.end dt-hhmmss-ms-list-grp'
        ) as HhMmSsMsListGrpEle;
    }
    private get _startTimePopover() {
        return this.shadowRoot?.querySelector(
            '.start dt-popover'
        ) as PopoverEle;
    }
    private get _endTimePopover() {
        return this.shadowRoot?.querySelector('.end dt-popover') as PopoverEle;
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
        this._startTimePopover.addEventListener(
            'open-change',
            this._onTimePopoverOpenChange
        );
        this._endTimePopover.addEventListener(
            'open-change',
            this._onTimePopoverOpenChange
        );
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
        this.shadowRoot
            ?.querySelectorAll('#time-selector-done-btn')
            .forEach((btn) => {
                btn.addEventListener('click', this._onTimeSelectorDoneClick);
            });
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
        this._startTimePopover.removeEventListener(
            'open-change',
            this._onTimePopoverOpenChange
        );
        this._endTimePopover.removeEventListener(
            'open-change',
            this._onTimePopoverOpenChange
        );
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
        this.shadowRoot
            ?.querySelectorAll('#time-selector-done-btn')
            .forEach((btn) => {
                btn.removeEventListener('click', this._onTimeSelectorDoneClick);
            });
    }

    protected _onAttrChanged(name: string, oldValue: string, newValue: string) {
        super._onAttrChanged(name, oldValue, newValue);
        this._render();
    }

    private _updateNavCtrlBtn() {
        const timeStart = new Date(this._startNavEle.millisecond);
        const timeEnd = new Date(this._endNavEle.millisecond);
        const showCtrlBtn = diffInMonth(timeStart, timeEnd) > 1;
        this._startNavEle.showCtrlBtnMonthAdd = showCtrlBtn;
        this._endNavEle.showCtrlBtnMonthSub = showCtrlBtn;
    }

    private _render = debounce(() => {
        if (!this.isConnected) return;
        let timeStart = this.timeStart as Date;
        let timeEnd = this.timeEnd as Date;
        if (timeStart > timeEnd) [timeStart, timeEnd] = [timeEnd, timeStart];
        this._startCalendar.weekStartAt = this._endCalendar.weekStartAt =
            this.weekStartAt;
        const tz = new Date().getTimezoneOffset() * 60 * 1000;
        this._startNavEle.millisecond =
            this._startCalendar.showingTime =
            this._startCalendar.timeStart =
            this._endCalendar.timeStart =
                +timeStart;
        this._startTimeSelector.millisecond =
            (+timeStart - tz) % (24 * 60 * 60 * 1000);
        this._endCalendar.timeEnd = this._startCalendar.timeEnd = +timeEnd;
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
        this._endTimeSelector.millisecond =
            (+timeEnd - tz) % (24 * 60 * 60 * 1000);
        this.shadowRoot!.querySelector(
            '.wrapper.start .time-echo'
        )!.textContent = this.timeFormatter(timeStart as Date);
        this.shadowRoot!.querySelector('.wrapper.end .time-echo')!.textContent =
            this.timeFormatter(timeEnd as Date);
        this._updateDateEcho();
        this._updateNavCtrlBtn();
    }, 0);

    private _updateDateEcho() {
        let timeStart = this.timeStart as Date;
        let timeEnd = this.timeEnd as Date;
        if (timeStart > timeEnd) [timeStart, timeEnd] = [timeEnd, timeStart];
        this.shadowRoot!.querySelector('.start-date-echo')!.textContent =
            this.dateFormatter(timeStart);
        this.shadowRoot!.querySelector('.end-date-echo')!.textContent =
            this.dateFormatter(timeEnd);
        this.shadowRoot!.querySelector(
            '.start-date-echo-wrapper'
        )!.classList.toggle('active', !this._selectedDate);
        this.shadowRoot!.querySelector(
            '.end-date-echo-wrapper'
        )!.classList.toggle('active', !!this._selectedDate);
    }

    private _onCalendarSelect = (e: CalendarBaseEvent['select-time']) => {
        e.stopPropagation();
        if (this._selectedDate) {
            this._selectedDate = null;
            this.timeEnd = +e.detail + this._endTimeSelector.millisecond;
        } else {
            this._selectedDate = this.timeEnd as unknown as Date;
            this.timeStart = +e.detail + this._startTimeSelector.millisecond;
        }
    };
    private _onCalendarItemHover = (e: CalendarBaseEvent['hover-item']) => {
        e.stopPropagation();
        if (!this._selectedDate) return;
        this.timeEnd = +e.detail + this._endTimeSelector.millisecond;
    };
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
    private _onTimePopoverOpenChange = (e: PopoverEvent['open-change']) => {
        if (!(e.target instanceof PopoverEle)) return;
        e.stopPropagation();
        if (!e.detail) return this._render(); // for reset time selector value
        e.target
            .querySelectorAll<HhMmSsMsListGrpEle>('dt-hhmmss-ms-list-grp')
            .forEach((ele) => {
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
            this.timeStart = calcTime(
                this.timeStart as Date,
                this._startTimeSelector.millisecond
            );
            this._startTimePopover.open = false;
        } else if (type === 'end') {
            this.timeEnd = calcTime(
                this.timeEnd as Date,
                this._endTimeSelector.millisecond
            );
            this._endTimePopover.open = false;
        }
    };

    public showCalendarDatePoint() {
        this._render();
    }

    public timeFormatter = (time: Date) =>
        new Date(+time - new Date().getTimezoneOffset() * 60 * 1000)
            .toISOString()
            .slice(11, 23);
    public dateFormatter = (time: Date) => time.toLocaleDateString('en-GB');
}

Ele.define();
