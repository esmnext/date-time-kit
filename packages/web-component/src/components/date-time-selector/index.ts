import { closestByEvent } from '../../utils';
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
import type { Ele as PopoverEle, EventMap as PopoverEvent } from '../popover';
import {
    clearupPopEleAttrSync2Parent,
    parentPopAttrSync2PopEle,
    popEleAttrSync2Parent,
    popoverAttrKeys,
    type reExportPopoverAttrs
} from '../popover/attr-sync-helper';
import {
    type BaseAttrs,
    type BaseEmits,
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

export type Attrs = BaseAttrs &
    reExportPopoverAttrs & {
        /**
         * Set which day of the week is the first day.
         * @type `'sun' | 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat'`
         * @default 'sun'
         */
        'week-start-at'?: Weeks;
        /**
         * The time of the calendar.
         * @type {`string | number`} A value that can be passed to the Date constructor.
         * @default Math.min('max-time', Math.max('min-time', Date.now()))
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
         * 例如设置为 'minute'，则表示只能选择到分钟，秒和毫秒将被忽略。忽略的时间单位将被重置为 0。
         */
        'min-granularity'?: Granularity;
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
 * 存在一个 timeFormatter 方法，用于格式化时分秒毫秒显示时间。
 */
export class Ele extends UiBase<Attrs, Emits> {
    public static readonly tagName = 'dt-date-time-selector' as const;
    protected static _style = styleStr;
    protected static _template = html;

    static get observedAttributes(): string[] {
        return [
            ...(super.observedAttributes as (keyof BaseAttrs)[]),
            'week-start-at',
            'current-time',
            'showing-time',
            'min-time',
            'max-time',
            'min-granularity',
            ...popoverAttrKeys
        ] satisfies (keyof Attrs)[];
    }
    private _getTimeAttr(name: keyof Attrs, defaultValue: string) {
        const v = this._getAttr(name, defaultValue);
        return new Date(Number.isNaN(+v) ? v : +v);
    }
    private _setTimeAttr(name: keyof Attrs, value: number | string | Date) {
        const v = new Date(value);
        if (Number.isNaN(+v)) return;
        this.setAttribute(name, +v + '');
    }
    private _getMaxMinTime({
        min = +this._getTimeAttr('min-time', 'NaN'),
        max = +this._getTimeAttr('max-time', 'NaN')
    } = {}) {
        if (Number.isNaN(min)) min = Number.NEGATIVE_INFINITY;
        if (Number.isNaN(max)) max = Number.POSITIVE_INFINITY;
        if (min > max) [min, max] = [max, min];
        return { min, max };
    }
    public get currentTime() {
        const { min, max } = this._getMaxMinTime();
        const currTime = this._getTimeAttr('current-time', '' + Date.now());
        if (+currTime < min) return new Date(min);
        if (+currTime > max) return new Date(max);
        return currTime;
    }
    public set currentTime(val: number | string | Date) {
        const v = new Date(val);
        if (Number.isNaN(+v)) return;
        const { min, max } = this._getMaxMinTime();
        this._setTimeAttr('current-time', Math.min(max, Math.max(min, +v)));
    }
    public get showingTime() {
        return this._getTimeAttr('showing-time', '' + +this.currentTime);
    }
    public set showingTime(val: number | string | Date) {
        this._setTimeAttr('showing-time', val);
    }
    public get minTime() {
        return this._getMaxMinTime().min;
    }
    public set minTime(val: number | string | Date) {
        const { min, max } = this._getMaxMinTime({
            min: +new Date(Number.isNaN(+val) ? val : +val)
        });
        this._setTimeAttr('min-time', min);
        this._setTimeAttr('max-time', max);
    }
    public get maxTime() {
        return this._getMaxMinTime().max;
    }
    public set maxTime(val: number | string | Date) {
        const { min, max } = this._getMaxMinTime({
            max: +new Date(Number.isNaN(+val) ? val : +val)
        });
        this._setTimeAttr('min-time', min);
        this._setTimeAttr('max-time', max);
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

    get _staticEls() {
        return {
            ...super._staticEls,
            nav: this.$0<YyyyMmNavEle>`dt-yyyymm-nav`!,
            calendar: this.$0<CalendarBaseEle>`dt-calendar-base`!,
            timeSelector: this.$0<HhMmSsMsSelectorEle>`dt-hhmmss-ms-selector`!,
            popover: this.$0<PopoverEle>`dt-popover`!
        } as const;
    }

    public connectedCallback() {
        if (!super.connectedCallback()) return;
        const { _els } = this;
        _els.calendar.formatter = (n) => ('' + n).padStart(2, '0');
        this._render();
        popEleAttrSync2Parent(this, _els.popover);
        this._bindEvt(_els.calendar)('select-time', this._onCalendarSelect);
        this._bindEvt(_els.nav)('change', this._onNavChange);
        this._bindEvt(_els.nav)('popover-open-change', this._onNavOpenToggle);
        this._bindEvt(_els.timeSelector)(
            'select-time',
            this._onTimeSelectorChange
        );
        this._bindEvt(_els.timeSelector)('open-change', this._stopEvent);
        this.dispatchEvent('select-time', this.currentTime as Date);
    }
    public disconnectedCallback() {
        clearupPopEleAttrSync2Parent(this);
        return super.disconnectedCallback();
    }
    protected _onAttrChanged(
        name: string,
        oldValue: string | null,
        newValue: string | null
    ) {
        super._onAttrChanged(name, oldValue, newValue);
        if (
            parentPopAttrSync2PopEle(
                name,
                oldValue,
                newValue,
                this._els.popover
            )
        ) {
            return;
        }
        this._render();
        if (name === 'current-time') {
            this.dispatchEvent('select-time', this.currentTime as Date);
        }
    }

    private _render = super._genRenderFn(() => {
        const currentTime = this.currentTime as Date;
        const { _els } = this;
        _els.calendar.weekStartAt = this.weekStartAt;
        this._els.nav.millisecond =
            _els.calendar.timeStart =
            _els.calendar.timeEnd =
                +currentTime;
        _els.calendar.showingTime = this.showingTime;
        const { min, max } = this._getMaxMinTime();
        _els.calendar.minTime = min;
        _els.calendar.maxTime = max;

        if (this.minGranularity === 'day') {
            _els.timeSelector.style.display = 'none';
            return;
        }
        _els.timeSelector.style.display = '';
        _els.timeSelector.minGranularity = this.minGranularity;
        _els.timeSelector.currentTime = currentTime;
    });

    private _onCalendarSelect = (e: CalendarBaseEvent['select-time']) => {
        e.stopPropagation();
        this.currentTime =
            +e.detail +
            (this.minGranularity === 'day'
                ? 0
                : this._els.timeSelector.millisecond);
    };
    private _onNavChange = (e: YyyyMmNavEvent['change']) => {
        e.stopPropagation();
        const wrapper = closestByEvent(e, '.wrapper');
        if (!wrapper) return;
        const { newTime } = e.detail;
        this._els.calendar.showingTime = +newTime;
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
        return this._els.timeSelector.timeFormatter;
    }
    public set timeFormatter(fn: (
        time: Date,
        minGranularity: TimeGranularity
    ) => string) {
        if (typeof fn !== 'function') return;
        this._els.timeSelector.timeFormatter = fn;
    }
}

Ele.define();
