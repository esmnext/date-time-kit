import { closestByEvent, debounce, html } from '../../utils';
import {
    type BaseAttrs,
    type Emit2EventMap,
    UiBase
} from '../web-component-base';
import {
    Ele as YyyyMmNavEle,
    type EventMap as YyyyMmNavEvent
} from '../yyyymm-nav';
import { styleStr } from './styleStr';
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

const granularityList = [
    'day',
    'hour',
    'minute',
    'second',
    'millisecond'
] as const;

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
    'min-granularity'?: 'day' | 'hour' | 'minute' | 'second' | 'millisecond';
}

export interface Emits {
    'select-time': Date;
    'open-change': boolean;
}
export type EventMap = Emit2EventMap<Emits>;

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
    public set minGranularity(val:
        | 'day'
        | 'hour'
        | 'minute'
        | 'second'
        | 'millisecond') {
        if (!granularityList.includes(val)) return;
        this.setAttribute('min-granularity', val);
    }

    protected _style = styleStr;
    protected _template = html`
<dt-popover>
    <slot slot="trigger" name="trigger"><button>select date and time</button></slot>
    <div slot="pop" class="wrapper menu">
        <dt-yyyymm-nav
            show-ctrl-btn-month-add
            show-ctrl-btn-month-sub
        ></dt-yyyymm-nav>
        <dt-calendar-base></dt-calendar-base>
        <dt-popover id="time-popover">
            <div slot="trigger" class="time-echo-wrapper">
                <i class="time-icon"></i>
                <span class="time-echo">hh:mm:ss.sss</span>
            </div>
            <div slot="pop" class="time-selector">
                <h3 class="title">Select Time</h3>
                <dt-hhmmss-ms-list-grp></dt-hhmmss-ms-list-grp>
                <button id="time-selector-done-btn">Done</button>
            </div>
        </dt-popover>
    </div>
</dt-popover>
`;

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
            'dt-hhmmss-ms-list-grp'
        ) as HhMmSsMsListGrpEle;
    }
    private get _timePopover() {
        return this.shadowRoot?.querySelector('#time-popover') as PopoverEle;
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
        this._timePopover.addEventListener(
            'open-change',
            this._onTimePopoverOpenChange
        );
        this._navEle.addEventListener(
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
        this._calendar.removeEventListener(
            'select-time',
            this._onCalendarSelect
        );
        this._navEle.removeEventListener('change', this._onNavChange);
        this._timePopover.removeEventListener(
            'open-change',
            this._onTimePopoverOpenChange
        );
        this._navEle.removeEventListener(
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
        if (name === 'current-time') {
            this.dispatchEvent('select-time', this.currentTime as Date);
        }
    }

    private _render = debounce(() => {
        if (!this.isConnected) return;
        const currentTime = this.currentTime as Date;
        this._calendar.weekStartAt = this.weekStartAt;
        const tz = new Date().getTimezoneOffset() * 60 * 1000;
        this._navEle.millisecond =
            this._calendar.timeStart =
            this._calendar.timeEnd =
                +currentTime;
        this._calendar.showingTime = this.showingTime;

        const selectorWrapper =
            this.shadowRoot!.querySelector<HTMLElement>('.time-selector')!;
        if (this.minGranularity === 'day') {
            this._timeSelector.millisecond = 0;
            selectorWrapper.style.display = 'none';
            return;
        }
        selectorWrapper.style.display = '';
        this._timeSelector.minGranularity = this.minGranularity;

        this._timeSelector.millisecond =
            (+currentTime - tz) % (24 * 60 * 60 * 1000);
        this.shadowRoot!.querySelector('.wrapper .time-echo')!.textContent =
            this.timeFormatter(currentTime as Date, this.minGranularity);
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
    private _onTimePopoverOpenChange = (e: PopoverEvent['open-change']) => {
        if (!(e.target instanceof PopoverEle)) return;
        e.stopPropagation();
        if (!e.detail) return this._render(); // for reset time selector value
        e.target
            .querySelector<HhMmSsMsListGrpEle>('dt-hhmmss-ms-list-grp')
            ?.scrollToCurrentItem();
    };
    private _onNavOpenToggle = (e: YyyyMmNavEvent['popover-open-change']) => {
        if (!(e.target instanceof YyyyMmNavEle)) return;
        e.stopPropagation();
        e.target.nextElementSibling?.classList.toggle('hide', e.detail);
    };
    private _onTimeSelectorDoneClick = (e: Event) => {
        const btn = closestByEvent(e, '#time-selector-done-btn');
        if (!btn) return;
        const calcTime = (time: Date, ms: number) => {
            time.setHours(0, 0, 0, 0);
            time.setMilliseconds(ms);
            return time;
        };
        this.currentTime = calcTime(
            this.currentTime as Date,
            this._timeSelector.millisecond
        );
        this._timePopover.open = false;
    };

    public timeFormatter = (
        time: Date,
        minGranularity: 'day' | 'hour' | 'minute' | 'second' | 'millisecond'
    ) => {
        const t = new Date(+time - new Date().getTimezoneOffset() * 60 * 1000)
            .toISOString()
            .slice(11, 23);
        if (minGranularity === 'day') return '';
        if (minGranularity === 'hour') return t.slice(0, 2);
        if (minGranularity === 'minute') return t.slice(0, 5);
        if (minGranularity === 'second') return t.slice(0, 8);
        return t;
    };
}

Ele.define();
