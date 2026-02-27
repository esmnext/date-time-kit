import { closestByEvent } from '../../utils';
import {
    type BaseEmits,
    EleMixin,
    type Emit2EventMap,
    UiBase,
    booleanAttr,
    enumAttr,
    timeAttr
} from '../web-component-base';
import styleStr from './index.css';
import html from './index.html';
import { type Weeks, getWeekInOrder, weekKey } from './weeks';
export { type Weeks, weekKey, getWeekInOrder } from './weeks';

const props = {
    /**
     * The showing time, used to determine the month to show on calendar.
     * @type {`string | number`} A value that can be passed to the Date constructor.
     * @default Date.now()
     */
    showingTime: timeAttr('showing-time'),
    /**
     * The start time of the calendar display range.
     * @type {`string | number`} A value that can be passed to the Date constructor.
     * @default 'showing-time'
     */
    timeStart: timeAttr('time-start', { defaultValueFromAttr: 'showing-time' }),
    /**
     * The end time of the calendar display range.
     * @type {`string | number`} A value that can be passed to the Date constructor.
     * @default 'time-start'
     */
    timeEnd: timeAttr('time-end', { defaultValueFromAttr: 'time-start' }),
    /**
     * The minimum time of the calendar display range.
     * @type {`string | number`} A value that can be passed to the Date constructor.
     */
    minTime: timeAttr('min-time', { defaultValue: () => 'NaN' }),
    /**
     * The maximum time of the calendar display range.
     * @type {`string | number`} A value that can be passed to the Date constructor.
     */
    maxTime: timeAttr('max-time', { defaultValue: () => 'NaN' }),
    /**
     * Set which day of the week is the first day.
     * @type `'sun' | 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat'`
     * @default 'sun'
     */
    weekStartAt: enumAttr('week-start-at', {
        validValues: weekKey,
        defaultValue: 'sun'
    }),
    /**
     * Whether to show the days of the previous and next months in the current month's calendar.
     * @type {boolean}
     * @default false
     */
    showOtherMonth: booleanAttr('show-other-month')
};

export interface Emits extends BaseEmits {
    'select-time': Date;
    'hover-item': Date;
}
export type EventMap = Emit2EventMap<Emits>;

/**
 * 基础的日历显示组件。仅显示星期和数字。
 */
export class Ele extends EleMixin(props, {} as Emits, UiBase) {
    public static tagName = 'dt-calendar-base' as const;
    protected static _style = styleStr;
    protected static _template = html;

    get _staticEls() {
        return {
            ...super._staticEls,
            weeks: this.$`.week`,
            items: this.$`.item`
        } as const;
    }

    public connectedCallback() {
        if (!super.connectedCallback()) return;
        this._onWeekStartAtChange();
        this._onTimeChange();
        this._bindEvt(this)('click', this._onClick);
        this._bindEvt`.wrapper`('pointerover', this._onPointerOver);
    }

    protected _onAttrChanged(
        name: string,
        oldValue: string | null,
        newValue: string | null
    ) {
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

    private _onWeekStartAtChange = super._genRenderFn(() => {
        const weekOrder = getWeekInOrder(this.weekStartAt);
        this._els.weeks.forEach((ele, i) => {
            ele.setAttribute('i18n-key', `date.${weekOrder[i]}`!);
        });
        this._onTimeChange();
    });

    private _onTimeChange = super._genRenderFn(() => {
        const currentTime = this.showingTime;
        let timeStart = this.timeStart;
        let timeEnd = this.timeEnd;
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

        const minTime = this.minTime;
        const maxTime = this.maxTime;
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
        const items = this._els.items;
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
        const inRangeItem = items.filter((e) =>
            e.classList.contains('in-range')
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
    });

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

    public formatter = (i: number) => (i < 10 ? '0' : '') + i;
}

Ele.define();
