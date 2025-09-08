import { closestByEvent, debounce } from '../../utils';
import {
    type Ele as CalendarBaseEle,
    type EventMap as CalendarBaseEvent,
    type Weeks,
    weekKey
} from '../calendar';
import {
    type Ele as HhMmSsMsSelectorEle,
    type EventMap as HhMmSsMsSelectorEvent,
    type Granularity as TimeGranularity,
    granularityList as timeGranularityList
} from '../hhmmss-ms-list-grp/selector';
import { Ele as PopoverEle, type EventMap as PopoverEvent } from '../popover';
import {
    type BaseAttrs,
    type Emit2EventMap,
    UiBase
} from '../web-component-base';
import {
    Ele as YyyyMmNavEle,
    type EventMap as YyyyMmNavEvent
} from '../yyyymm-nav';
import html from './index.html';
import { styleStr } from './styleStr';

export const granularityList = ['day', ...timeGranularityList] as const;
export type Granularity = (typeof granularityList)[number];

export interface Attrs extends BaseAttrs {
    /**
     * Set which day of the week is the first day.
     * @type `'sun' | 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat'`
     * @default 'sun'
     */
    'week-start-at'?: Weeks;
    /**
     * The time of the calendar.
     * @type {`string | number`} A value that can be passed to the Date constructor.
     * @default Date.now()
     */
    'current-time'?: string | number;
    /**
     * The showing time, used to determine the month to show on calendar.
     * @type {`string | number`} A value that can be passed to the Date constructor.
     * @default 'current-time'
     */
    'showing-time'?: string | number;
    /**
     * 选择器的粒度，表示最小可选的时间单位。默认为 millisecond。
     * 例如设置为 'minute'，则表示只能选择到分钟，秒和毫秒将被忽略。
     */
    'min-granularity'?: Granularity;
}

export interface Emits {
    'select-time': Date;
    'open-change': boolean;
}
export type EventMap = Emit2EventMap<Emits>;

/**
 * 日期时间选择器（单个时间点）
 * 包括日历和时分秒毫秒选择。
 *
 * 存在一个 timeFormatter 方法，用于格式化时分秒毫秒显示时间。
 */
export class Ele extends UiBase<Attrs, Emits> {
    public static readonly tagName = 'dt-date-time-selector' as const;
    static get observedAttributes(): string[] {
        return [
            ...(super.observedAttributes as (keyof BaseAttrs)[]),
            'week-start-at',
            'current-time',
            'showing-time',
            'min-granularity'
        ] satisfies (keyof Attrs)[];
    }
    public get currentTime() {
        const v = this._getAttr('current-time', '' + Date.now());
        return new Date(Number.isNaN(+v) ? v : +v);
    }
    public set currentTime(val: number | string | Date) {
        const v = new Date(val);
        if (Number.isNaN(+v)) return;
        this.setAttribute('current-time', +v + '');
    }
    public get showingTime() {
        const v = this._getAttr('showing-time', '' + this.currentTime);
        return new Date(Number.isNaN(+v) ? v : +v);
    }
    public set showingTime(val: number | string | Date) {
        const v = new Date(val);
        if (Number.isNaN(+v)) return;
        this.setAttribute('showing-time', +v + '');
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
    public set minGranularity(val: NonNullable<Attrs['min-granularity']>) {
        if (!granularityList.includes(val)) return;
        this.setAttribute('min-granularity', val);
    }

    protected _style = styleStr;
    protected _template = html;

    private get _navEle() {
        return this.shadowRoot?.querySelector('dt-yyyymm-nav') as YyyyMmNavEle;
    }
    private get _calendar() {
        return this.shadowRoot?.querySelector(
            'dt-calendar-base'
        ) as CalendarBaseEle;
    }
    private get _timeSelector() {
        return this.shadowRoot?.querySelector(
            'dt-hhmmss-ms-selector'
        ) as HhMmSsMsSelectorEle;
    }

    constructor() {
        super();
        this._applyTemplate();
    }

    public connectedCallback() {
        if (!super.connectedCallback()) return;
        this._calendar.formatter = (i: number) => String(i).padStart(2, '0');
        this._render();
        this._calendar.addEventListener('select-time', this._onCalendarSelect);
        this._navEle.addEventListener('change', this._onNavChange);
        this._navEle.addEventListener(
            'popover-open-change',
            this._onNavOpenToggle
        );
        this._timeSelector.addEventListener(
            'select-time',
            this._onTimeSelectorChange
        );
        this._timeSelector.addEventListener('open-change', this._stopEvent);
    }
    public disconnectedCallback() {
        if (!super.disconnectedCallback()) return;
        this._calendar.removeEventListener(
            'select-time',
            this._onCalendarSelect
        );
        this._navEle.removeEventListener('change', this._onNavChange);
        this._navEle.removeEventListener(
            'popover-open-change',
            this._onNavOpenToggle
        );
        this._timeSelector.removeEventListener(
            'select-time',
            this._onTimeSelectorChange
        );
        this._timeSelector.removeEventListener('open-change', this._stopEvent);
    }
    protected _onAttrChanged(name: string, oldValue: string, newValue: string) {
        super._onAttrChanged(name, oldValue, newValue);
        this._render();
        if (name === 'current-time') {
            this.dispatchEvent('select-time', this.currentTime as Date);
        }
    }

    private _render = debounce(() => {
        if (!this.isConnected) return;
        const currentTime = this.currentTime as Date;
        this._calendar.weekStartAt = this.weekStartAt;
        this._navEle.millisecond =
            this._calendar.timeStart =
            this._calendar.timeEnd =
                +currentTime;
        this._calendar.showingTime = this.showingTime;

        if (this.minGranularity === 'day') {
            this._timeSelector.style.display = 'none';
            return;
        }
        this._timeSelector.style.display = '';
        this._timeSelector.minGranularity = this.minGranularity;
        this._timeSelector.currentTime = currentTime;
    }, 0);

    private _onCalendarSelect = (e: CalendarBaseEvent['select-time']) => {
        e.stopPropagation();
        this.currentTime = +e.detail + this._timeSelector.millisecond;
    };
    private _onNavChange = (e: YyyyMmNavEvent['change']) => {
        e.stopPropagation();
        const wrapper = closestByEvent(e, '.wrapper');
        if (!wrapper) return;
        const { newTime } = e.detail;
        this._calendar.showingTime = +newTime;
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

    public get timeFormatter() {
        return this._timeSelector.timeFormatter;
    }
    public set timeFormatter(fn: (
        time: Date,
        minGranularity: TimeGranularity
    ) => string) {
        if (typeof fn !== 'function') return;
        this._timeSelector.timeFormatter = fn;
    }
}

Ele.define();
