import { Debounce, html } from "@/utils";
import { DefEle, UiBase } from "../ui-base";
import '@/components/i18n';
import styleStr from './index.scss?inline';

type Weeks = 'sun' | 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat';

const weekKey: Weeks[] = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
const getWeekInOrder = (startAt?: Weeks) => {
    if (!startAt) startAt = 'sun';
    const index = weekKey.indexOf(startAt);
    if (index === -1) return weekKey;
    return [...weekKey.slice(index), ...weekKey.slice(0, index)];
};

export interface Attrs {
    /**
     * The showing time, used to determine the month to show on calendar.
     * @type {`string | number`} A value that can be passed to the Date constructor.
     * @default Date.now()
     */
    'showing-time': string | number;
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
     * The minimum time of the calendar display range.
     * @type {`string | number`} A value that can be passed to the Date constructor.
     * @default '' (Not effective)
     */
    'min-time': string | number;
    /**
     * The maximum time of the calendar display range.
     * @type {`string | number`} A value that can be passed to the Date constructor.
     * @default '' (Not effective)
     */
    'max-time': string | number;
    /**
     * Set which day of the week is the first day.
     * @type `'sun' | 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat'`
     * @default 'sun'
     */
    'week-start-at': Weeks;
}

/**
 * 基础的日历显示组件。仅显示星期和数字。
 */
@DefEle('calendar-base')
export class Calendar extends UiBase {
    static get observedAttributes() {
        return [
            ...UiBase.observedAttributes,
            'showing-time',
            'time-start', 'time-end',
            'min-time', 'max-time',
            'week-start-at',
        ];
    }

    protected _style = styleStr;
    protected _template = `${
        weekKey.map(
            (key) => html`<dt-i18n class="week" i18n-key="date.${key}"></dt-i18n>`
        ).join('')
    }${
        [...Array(7 * 6)].map(
            (_, i) => html`<div class="item">${i % 31 + 1}</div>`
        ).join('')
    }`;

    constructor() {
        super();
        this._applyTemplate();
    }

    public connectedCallback() {
        this.onWeekStartAtChange();
        this.onTimeChange();
    }

    public attributeChangedCallback(name: string, oldValue: string, newValue: string) {
        super.attributeChangedCallback(name, oldValue, newValue);
        if (oldValue === newValue) return;
        if (name === 'week-start-at') {
            this.onWeekStartAtChange();
        }
        if ([
            "showing-time",
            "time-start", "time-end",
            "min-time", "max-time",
        ].includes(name)) {
            this.onTimeChange();
        }
    }

    @Debounce()
    private onWeekStartAtChange() {
        if (!this.shadowRoot) return;
        const weekOrder = getWeekInOrder(this.getAttribute('week-start-at') as Weeks);
        this.shadowRoot.querySelectorAll('.week').forEach((ele, i) => {
            ele.setAttribute('i18n-key', `date.${weekOrder[i]}`!);
        });
        this.onTimeChange();
    }

    @Debounce()
    private onTimeChange() {
        if (!this.shadowRoot) return;
        const showingTime = this.getAttribute('showing-time');

        const currentTime = showingTime ? new Date(showingTime) : new Date();
        currentTime.setHours(0, 0, 0, 0);
        let timeStart = new Date(this.getAttribute('time-start') || currentTime);
        let timeEnd = new Date(this.getAttribute('time-end') || timeStart);
        timeStart.setHours(0, 0, 0, 0);
        timeEnd.setHours(0, 0, 0, 0);

        if (Number.isNaN(+currentTime) || Number.isNaN(+timeStart) || Number.isNaN(+timeEnd)) {
            console.warn(`Invalid date attribute(s) on <${this.tagName}>`);
            return;
        }
        if (timeStart > timeEnd) {
            [timeStart, timeEnd] = [timeEnd, timeStart];
        }

        const minTime = new Date(this.getAttribute('min-time') || '');
        const maxTime = new Date(this.getAttribute('max-time') || '');
        minTime.setHours(0, 0, 0, 0);
        maxTime.setHours(0, 0, 0, 0);
        if (maxTime < timeEnd) timeEnd = maxTime;
        if (timeStart < minTime) timeStart = minTime;

        const weekStartAt = (this.getAttribute('week-start-at') || 'sun') as Weeks;

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
        const adjustedFirstWeek = (firstWeekOfCurMonth - weekStartOffset + 7) % 7;

        let itemIdx = 0;
        const items = this.shadowRoot.querySelectorAll('.item');

        // set previous month days
        for (let i = daysPrev - adjustedFirstWeek; i < daysPrev; ++i) {
            const ele = items[itemIdx++];
            ele.className = 'item disabled';
            ele.textContent = i + 1 + '';
        }

        // set current month days
        for (let i = 1; i <= days; ++i) {
            const ele = items[itemIdx++];
            const time = new Date(year, month, i);
            ele.className = 'item';
            ele.classList.toggle('disabled', time < minTime || time > maxTime);
            ele.classList.toggle('start', +time === +timeStart);
            ele.classList.toggle('end', +time === +timeEnd);
            ele.textContent = i + '';
        }

        // set next month days
        for (let i = 1; itemIdx < items.length; ++i) {
            const ele = items[itemIdx++];
            ele.className = 'item disabled';
            ele.textContent = i + '';
        }
    }
}
