import { closestByEvent, css, debounce, html } from '../../utils';
import I18nEle from '../i18n';
import { type BaseAttrs, UiBase } from '../web-component-base';
I18nEle.define();
// import styleStr from './index.scss?inline';
const styleStr = css`
:host {
  --gap: var(--calendar-item-gap, 10px 0);
  --item-size: var(--calendar-item-size, 30px);
  --color-disabled-text: var(--calendar-item-disabled-text, #aaa);
  --color-active-bg: var(--calendar-item-active-bg, #002BE7);
  --color-active-text: var(--calendar-item-active-text, #fff);
  --color-in-range-bg: var(--calendar-item-in-range-bg, #002BE726);
  --color-in-range-text: var(--calendar-item-in-range-text, #002BE7);
  --color-hover-bg: var(--calendar-item-hover-bg, #0000000D);
  --color-hover-text: var(--calendar-item-hover-text, #000);
}

.wrapper {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: var(--gap);
  width: 100%;
  height: 100%;
  justify-content: space-between;
  text-align: center;
}

.week {
  min-width: var(--item-size);
}

.item {
  min-width: var(--item-size);
  line-height: var(--item-size);
  height: var(--item-size);
  position: relative;
  --half-period-bg-w: calc(50% + var(--item-size) / 2);
}
.item span {
  position: relative;
  z-index: 2;
}
.item:not(.disabled) {
  cursor: pointer;
}
:host([show-other-month]) .item.prev.disabled, :host([show-other-month]) .item.next.disabled, .item.disabled:not(.prev, .next) {
  cursor: not-allowed;
  color: var(--color-disabled-text);
}
.item:hover {
  color: var(--color-hover-text);
}
.item.in-range {
  color: var(--color-in-range-text);
}
.item:not(.disabled) .highlight {
  display: block;
  border-radius: 50%;
  position: absolute;
  top: 50%;
  left: 50%;
  width: var(--item-size);
  height: var(--item-size);
  transform: translate(-50%, -50%);
}
.item.start, .item.end {
  color: var(--color-active-text);
}
.item.start .highlight, .item.end .highlight {
  background-color: var(--color-active-bg);
}
.item:hover .highlight {
  background-color: var(--color-hover-bg);
}
.item.in-range .bg {
  display: block;
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 43, 231, 0.1490196078);
}
.item:nth-of-type(7n + 1) .bg {
  border-radius: var(--item-size) 0 0 var(--item-size);
  width: var(--half-period-bg-w);
  left: calc(50% - var(--item-size) / 2);
}
.item:nth-of-type(7n) .bg {
  border-radius: 0 var(--item-size) var(--item-size) 0;
  width: var(--half-period-bg-w);
}
.item:nth-of-type(7n).range-start .bg {
  width: var(--item-size);
  left: calc(50% - var(--item-size) / 2);
}
.item.range-start .bg {
  border-top-left-radius: var(--item-size);
  border-bottom-left-radius: var(--item-size);
  width: var(--half-period-bg-w);
  left: calc(50% - var(--item-size) / 2);
}
.item.range-end .bg {
  border-top-right-radius: var(--item-size);
  border-bottom-right-radius: var(--item-size);
  width: var(--half-period-bg-w);
}
.item.range-start.range-end .bg {
  width: var(--item-size);
}
.item:nth-of-type(7n).range-start .bg, .item:nth-of-type(7n + 1).range-end .bg {
  width: var(--item-size);
}
`;

export type Weeks = 'sun' | 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat';

export const weekKey: Weeks[] = [
    'sun',
    'mon',
    'tue',
    'wed',
    'thu',
    'fri',
    'sat'
];
export const getWeekInOrder = (startAt?: Weeks | null) => {
    if (!startAt) startAt = 'sun';
    const index = weekKey.indexOf(startAt);
    if (index === -1) return weekKey;
    return [...weekKey.slice(index), ...weekKey.slice(0, index)];
};

export interface CalendarBaseAttrs extends BaseAttrs {
    /**
     * The showing time, used to determine the month to show on calendar.
     * @type {`string | number`} A value that can be passed to the Date constructor.
     * @default Date.now()
     */
    'showing-time'?: string | number;
    /**
     * The start time of the calendar display range.
     * @type {`string | number`} A value that can be passed to the Date constructor.
     * @default 'current-time'
     */
    'time-start'?: string | number;
    /**
     * The end time of the calendar display range.
     * @type {`string | number`} A value that can be passed to the Date constructor.
     * @default 'time-start'
     */
    'time-end'?: string | number;
    /**
     * The minimum time of the calendar display range.
     * @type {`string | number`} A value that can be passed to the Date constructor.
     */
    'min-time'?: string | number;
    /**
     * The maximum time of the calendar display range.
     * @type {`string | number`} A value that can be passed to the Date constructor.
     */
    'max-time'?: string | number;
    /**
     * Set which day of the week is the first day.
     * @type `'sun' | 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat'`
     * @default 'sun'
     */
    'week-start-at'?: Weeks;
    /**
     * Whether to show the days of the previous and next months in the current month's calendar.
     * @type {boolean}
     * @default false
     */
    'show-other-month'?: boolean;
}

export interface CalendarBaseEmit {
    'select-time': Date;
    'hover-item': Date;
}

/**
 * 基础的日历显示组件。仅显示星期和数字。
 */
export default class CalendarBase extends UiBase<
    CalendarBaseAttrs,
    CalendarBaseEmit
> {
    protected static tagName = 'dt-calendar-base';
    static get observedAttributes(): string[] {
        return [
            ...(super.observedAttributes as (keyof BaseAttrs)[]),
            'showing-time',
            'time-start',
            'time-end',
            'min-time',
            'max-time',
            'week-start-at'
        ] satisfies (keyof CalendarBaseAttrs)[];
    }

    public get showingTime() {
        const v = this._getAttr('showing-time', '' + Date.now());
        return new Date(Number.isNaN(+v) ? v : +v);
    }
    public get timeStart() {
        const v = this._getAttr('time-start', '' + this.showingTime);
        return new Date(Number.isNaN(+v) ? v : +v);
    }
    public get timeEnd() {
        const v = this._getAttr('time-end', '' + this.timeStart);
        return new Date(Number.isNaN(+v) ? v : +v);
    }
    public get minTime() {
        const v = this._getAttr('min-time', '');
        return new Date(Number.isNaN(+v) ? v : +v);
    }
    public get maxTime() {
        const v = this._getAttr('max-time', '');
        return new Date(Number.isNaN(+v) ? v : +v);
    }
    private _setTimeAttr(
        name: keyof Omit<
            CalendarBaseAttrs,
            'week-start-at' | 'show-other-month' | keyof BaseAttrs
        >,
        value: number | string | Date
    ) {
        const v = new Date(value);
        if (Number.isNaN(+v)) return;
        this.setAttribute(name, +v + '');
    }
    public set showingTime(val: number | string | Date) {
        this._setTimeAttr('showing-time', val);
    }
    public set timeStart(val: number | string | Date) {
        this._setTimeAttr('time-start', val);
    }
    public set timeEnd(val: number | string | Date) {
        this._setTimeAttr('time-end', val);
    }
    public set minTime(val: number | string | Date) {
        this._setTimeAttr('min-time', val);
    }
    public set maxTime(val: number | string | Date) {
        this._setTimeAttr('max-time', val);
    }
    public get weekStartAt() {
        return this._getAttr('week-start-at', 'sun');
    }
    public set weekStartAt(val: Weeks) {
        if (weekKey.includes(val)) return;
        this.setAttribute('week-start-at', val);
    }
    public get showOtherMonth() {
        return this.hasAttribute('show-other-month');
    }
    public set showOtherMonth(val: boolean) {
        this.setAttribute('show-other-month', '' + val);
    }

    protected _style = styleStr;
    protected _template = html`
<div class="wrapper">${
        weekKey
            .map(
                (key) =>
                    html`<dt-i18n class="week" i18n-key="date.${key}" part="week"></dt-i18n>`
            )
            .join('') +
        [...Array(7 * 6)]
            .map(
                (_, i) =>
                    html`<div class="item" part="item"><i class="bg"></i><i class="highlight"></i><span>${(i % 31) + 1}</span></div>`
            )
            .join('')
    }</div>`;

    constructor() {
        super();
        this._applyTemplate();
    }

    public connectedCallback() {
        if (!super.connectedCallback()) return;
        this._onWeekStartAtChange();
        this._onTimeChange();
        this.addEventListener('click', this._onClick);
        this.shadowRoot!.querySelector('.wrapper')!.addEventListener(
            'pointerover',
            this._onPointerOver
        );
    }
    public disconnectedCallback() {
        if (!super.disconnectedCallback()) return;
        this.removeEventListener('click', this._onClick);
        this.shadowRoot!.querySelector('.wrapper')!.removeEventListener(
            'pointerover',
            this._onPointerOver
        );
    }

    protected _onAttrChanged(name: string, oldValue: string, newValue: string) {
        super._onAttrChanged(name, oldValue, newValue);
        if (name === 'week-start-at') {
            this._onWeekStartAtChange();
        }
        if (
            [
                'showing-time',
                'time-start',
                'time-end',
                'min-time',
                'max-time'
            ].includes(name)
        ) {
            this._onTimeChange();
        }
    }

    private _onWeekStartAtChange = debounce(() => {
        if (!this.isConnected) return;
        const weekOrder = getWeekInOrder(this.weekStartAt);
        this.shadowRoot!.querySelectorAll('.week').forEach((ele, i) => {
            ele.setAttribute('i18n-key', `date.${weekOrder[i]}`!);
        });
        this._onTimeChange();
    }, 0);

    private _onTimeChange = debounce(() => {
        if (!this.isConnected) return;

        const currentTime = this.showingTime as Date;
        let timeStart = this.timeStart as Date;
        let timeEnd = this.timeEnd as Date;
        currentTime.setHours(0, 0, 0, 0);
        timeStart.setHours(0, 0, 0, 0);
        timeEnd.setHours(0, 0, 0, 0);

        if (
            Number.isNaN(+currentTime) ||
            Number.isNaN(+timeStart) ||
            Number.isNaN(+timeEnd)
        ) {
            console.warn(`Invalid date attribute(s) on <${this.tagName}>`);
            return;
        }
        if (timeStart > timeEnd) {
            [timeStart, timeEnd] = [timeEnd, timeStart];
        }

        const minTime = new Date(this._getAttr('min-time') || '');
        const maxTime = new Date(this._getAttr('max-time') || '');
        minTime.setHours(0, 0, 0, 0);
        maxTime.setHours(0, 0, 0, 0);
        if (maxTime < timeEnd) timeEnd = maxTime;
        if (timeStart < minTime) timeStart = minTime;

        const weekStartAt = this.weekStartAt;

        const year = currentTime.getFullYear();
        const month = currentTime.getMonth();

        // number of day for current month
        const days = new Date(year, month + 1, 0).getDate();
        // number of day for previous month
        const daysPrev = new Date(year, month, 0).getDate();
        // first day of the week for current month (0=Sunday, 1=Monday, ..., 6=Saturday)
        const firstWeekOfCurMonth = new Date(year, month, 1).getDay();

        // Calculate the offset for different week start days
        const weekStartOffset = weekKey.indexOf(weekStartAt);
        // Adjust the first day of week according to weekStartAt
        const adjustedFirstWeek =
            (firstWeekOfCurMonth - weekStartOffset + 7) % 7;

        let itemIdx = 0;
        const items = this.shadowRoot!.querySelectorAll<HTMLElement>('.item');
        const changeItemText = (item: HTMLElement, text: string) => {
            item.querySelector('span')!.textContent = text;
        };
        items.forEach((ele) => {
            ele.className = 'item disabled';
            ele.removeAttribute('data-time');
            ele.setAttribute('part', 'item disabled');
            changeItemText(ele, ' ');
        });

        // set previous month days
        for (let i = daysPrev - adjustedFirstWeek + 1; i <= daysPrev; ++i) {
            const ele = items[itemIdx++];
            ele.classList.add('prev');
            ele.part.add('prev');
            changeItemText(ele, this.showOtherMonth ? this.formatter(i) : ' ');
        }

        // set current month days
        for (let i = 1; i <= days; ++i) {
            const ele = items[itemIdx++];
            const time = new Date(year, month, i);
            ele.classList.toggle('month-start', i === 1);
            ele.classList.toggle('month-end', i === days);
            ele.classList.toggle('disabled', time < minTime || time > maxTime);
            ele.classList.toggle('start', +time === +timeStart);
            ele.classList.toggle(
                'in-range',
                +time >= +timeStart && +time <= +timeEnd
            );
            ele.classList.toggle('end', +time === +timeEnd);
            ele.setAttribute('part', ele.className);
            ele.dataset.time = time.toISOString();
            changeItemText(ele, this.formatter(i));
        }
        const inRangeItem = Array.from(
            this.shadowRoot!.querySelectorAll('.item.in-range')
        );
        if (inRangeItem.length) {
            inRangeItem[0].classList.add('range-start');
            inRangeItem[0].part.add('range-start');
            inRangeItem[inRangeItem.length - 1].classList.add('range-end');
            inRangeItem[inRangeItem.length - 1].part.add('range-end');
        }

        // set next month days
        for (let i = 1; itemIdx < items.length; ++i) {
            const ele = items[itemIdx++];
            ele.classList.add('next');
            ele.part.add('next');
            changeItemText(ele, this.showOtherMonth ? this.formatter(i) : ' ');
        }
    }, 0);

    private _onClick = (e: MouseEvent) => {
        const item = closestByEvent(e, '.item[data-time]:not(.disabled)', this);
        if (!item) return;
        const time = new Date(item.dataset.time!);
        super.dispatchEvent('select-time', time, true);
    };
    private _onPointerOver = (e: Event) => {
        const item = closestByEvent(e, '.item[data-time]:not(.disabled)', this);
        if (!item) return;
        const time = new Date(item.dataset.time!);
        super.dispatchEvent('hover-item', time, true);
    };

    public formatter = (i: number) => '' + i;
}

CalendarBase.define();
