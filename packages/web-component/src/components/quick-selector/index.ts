import { debounce, getCurrentTzOffset } from '../../utils';
import { type Weeks, weekKey } from '../calendar';
import { granularityList as timeGranularityList } from '../hhmmss-ms-list-grp/selector';
import type { Ele as PeriodSelectorEle } from '../period-selector';
import { Ele as PopoverEle, type EventMap as PopoverEvent } from '../popover';
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
import styleStr from './index.css';
import html, { utcText } from './index.html';
import {
    type DataLimit,
    type GenPeriodTimesOptions,
    type PeriodTimeInfo,
    type QuickGenPeriodTimesOptions,
    type QuickKey,
    UTCInfo2LocaleInfo,
    genPeriodTimes,
    localeInfo2UTCInfo,
    quickGenPeriodTime,
    quickGenPeriodTimeInfo,
    quickGenPeriodTimes,
    quickKeys
} from './quick-key';

export {
    type QuickKey,
    type DataLimit,
    type GenPeriodTimesOptions,
    type QuickGenPeriodTimesOptions,
    type PeriodTimeInfo,
    type Weeks,
    genPeriodTimes,
    quickGenPeriodTime,
    quickGenPeriodTimes,
    quickGenPeriodTimeInfo,
    localeInfo2UTCInfo,
    UTCInfo2LocaleInfo
};

export const granularityList = ['day', ...timeGranularityList] as const;
export type Granularity = (typeof granularityList)[number];

export type Attrs = BaseAttrs &
    reExportPopoverAttrs & {
        /**
         * Timezone in minutes. For example: UTC+05:45 => `-345`, UTC-01:00 => `60`.
         *
         * @default
         * new Date().getTimezoneOffset() // locale timezone in minutes
         */
        'tz-offset'?: number;
        /**
         * Set which day of the week is the first day.
         * @type `'sun' | 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat'`
         * @default 'sun'
         */
        'week-start-at'?: Weeks;
        /**
         * Quick selection key.
         *
         * @default 'all'
         */
        'quick-key'?: QuickKey;
        /**
         * Start locale time of the quick selection. Only works in custom mode.
         */
        'start-time'?: string | number | '';
        /**
         * End locale time of the quick selection. Only works in custom mode.
         */
        'end-time'?: string | number | '';
        /**
         * 选择器的粒度，表示最小可选的时间单位。默认为 millisecond。
         * 例如设置为 'minute'，则表示只能选择到分钟，秒和毫秒将被忽略。忽略的时间单位视情况重置为 0 或 23 或 59 或 999。
         */
        'min-granularity'?: Granularity;
        /**
         * Exclude some quick selection options.
         *
         * @example
         * ```ts
         * exclude-field="last7Days, last30Days, timezone"
         * ```
         */
        'exclude-field'?: (QuickKey | 'timezone')[];
    };

export interface Emits extends BaseEmits {
    'time-changed': PeriodTimeInfo;
    'open-change': boolean;
}
export type EventMap = Emit2EventMap<Emits>;

/**
 * 快速选择下拉选项
 */
export class Ele extends UiBase<Attrs, Emits> {
    public static readonly tagName = 'dt-quick-selector' as const;
    protected static _style = styleStr;
    protected static _template = html;

    static get observedAttributes(): string[] {
        return [
            ...(super.observedAttributes as (keyof BaseAttrs)[]),
            'tz-offset',
            'week-start-at',
            'quick-key',
            'start-time',
            'end-time',
            'min-granularity',
            'exclude-field',
            ...popoverAttrKeys
        ] satisfies (keyof Attrs)[];
    }

    public get tzOffset() {
        return +this._getAttr('tz-offset', '' + getCurrentTzOffset());
    }
    public set tzOffset(v: number) {
        if (!Number.isSafeInteger(v)) return;
        this.setAttribute('tz-offset', '' + v);
    }
    public get quickKey() {
        return this._getAttr('quick-key', 'all');
    }
    public set quickKey(val: QuickKey) {
        if (!quickKeys.includes(val)) return;
        this.setAttribute('quick-key', val);
    }
    public get weekStartAt() {
        return this._getAttr('week-start-at', 'sun');
    }
    public set weekStartAt(val: Weeks) {
        if (!weekKey.includes(val)) return;
        this.setAttribute('week-start-at', val);
    }
    public get startTime() {
        const v = this._getAttr('start-time', '');
        if (v === '') return '';
        return new Date(Number.isNaN(+v) ? v : +v);
    }
    public set startTime(val: number | string | Date) {
        if (val === '') {
            this.removeAttribute('start-time');
            return;
        }
        const v = new Date(val);
        if (Number.isNaN(+v)) return;
        this.setAttribute('start-time', +v + '');
    }
    public get endTime() {
        const v = this._getAttr('end-time', '' + this.startTime);
        if (v === '') return '';
        return new Date(Number.isNaN(+v) ? v : +v);
    }
    public set endTime(val: number | string | Date) {
        if (val === '') {
            this.removeAttribute('end-time');
            return;
        }
        const v = new Date(val);
        if (Number.isNaN(+v)) return;
        this.setAttribute('end-time', +v + '');
    }
    public get minGranularity() {
        return this._getAttr('min-granularity', 'millisecond');
    }
    public set minGranularity(val: NonNullable<Attrs['min-granularity']>) {
        if (!granularityList.includes(val)) return;
        this.setAttribute('min-granularity', val);
    }
    public get excludeField() {
        const v = this._getAttr('exclude-field', '') || '';
        if (v === '') return [];
        return (v as string).split(',').map((i) => i.trim()) as (
            | QuickKey
            | 'timezone'
        )[];
    }
    public set excludeField(v: (QuickKey | 'timezone')[]) {
        if (!Array.isArray(v) || v.length === 0) {
            this.removeAttribute('exclude-field');
            return;
        }
        const arr = v.filter(
            (i) => quickKeys.includes(i as QuickKey) || i === 'timezone'
        );
        this.setAttribute('exclude-field', arr.join(','));
    }

    get _staticEls() {
        return {
            ...super._staticEls,
            periodSelector: this.$0<PeriodSelectorEle>`dt-period-selector`!,
            popover: this.$0<PopoverEle>`dt-popover`!
        } as const;
    }

    public connectedCallback() {
        if (!super.connectedCallback()) return;
        this._renderTz();
        this._updateRadio();
        this._updatePeriodSelector();
        const { _els } = this;
        this._bindEvt(_els.popover)('open-change', this._onPopoverChange);
        this._bindEvt`.tz-trigger`('click', this._onTzTriggerClick);
        this._bindEvt`.custom-trigger`('click', this._onCustomTriggerClick);
        this._bindEvt`.menu.tz .title svg`('click', this._onBackBtnClick);
        this._bindEvt`.menu.custom .title svg`('click', this._onBackBtnClick);
        this._bindEvt`.menu`('change', this._onRadioChange);
        this._bindEvt`#reset`('click', this._updatePeriodSelector);
        this._bindEvt`#done`('click', this._onDoneBtnClick);
        popEleAttrSync2Parent(this, this._els.popover);
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
        if (name === 'tz-offset') {
            this._renderTz();
            this._dispatchTimeChangeEvent();
        }
        if (name === 'quick-key') {
            this._updateRadio();
            this._dispatchTimeChangeEvent();
        }
        if (name === 'week-start-at') {
            this._updatePeriodSelector();
        }
        if (name === 'start-time' || name === 'end-time') {
            if (this.quickKey !== 'custom') return;
            this._updatePeriodSelector();
        }
    }

    private _updatePeriodSelector = super._genRenderFn(() => {
        this._els.periodSelector.weekStartAt = this.weekStartAt;
        if (this.$0`.menu.custom`?.style.display === 'none') return;
        const ele = this._els.periodSelector;
        const startTime = this.startTime;
        const endTime = this.endTime;
        if (startTime !== '' && endTime !== '') {
            ele.timeStart = startTime;
            ele.timeEnd = endTime;
        } else {
            const defaultPeriod = this.quickGenPeriodTime('last30Days');
            ele.timeStart = defaultPeriod.start;
            ele.timeEnd = defaultPeriod.end;
        }
        ele.minGranularity = this.minGranularity;
        ele.showCalendarDatePoint();
    });

    private _renderTz = super._genRenderFn(() => {
        const tzOffset = this.tzOffset;
        this.$<HTMLInputElement>`input[name="tz"]`.forEach((radio) => {
            radio.checked = +radio.value === tzOffset;
        });
        this.$0`.tz-trigger bdo`!.textContent = utcText(tzOffset);
    });
    private _updateRadio = super._genRenderFn(() => {
        const quickKey = this.quickKey;
        this
            .$0<HTMLInputElement>`input[name="radio"][value="${quickKey}"]`!.checked =
            true;
    });

    private _onPopoverChange = (e: PopoverEvent['open-change']) => {
        if (!(e.target instanceof PopoverEle)) return;
        if (e.detail === false) {
            this._showMenu('top');
        }
    };
    private _showMenu(type: 'top' | 'tz' | 'custom') {
        this.$`.menu`.forEach((menu) =>
            menu.classList.contains(type)
                ? (menu.slot = 'pop')
                : menu.removeAttribute('slot')
        );
        if (type === 'custom') {
            this._updatePeriodSelector();
        }
    }
    private _onTzTriggerClick = () => this._showMenu('tz');
    private _onCustomTriggerClick = (e: Event) => {
        e.preventDefault();
        this._showMenu('custom');
    };
    private _onBackBtnClick = () => this._showMenu('top');

    private _dispatchTimeChangeEvent = debounce(() => {
        const quickKey = this.quickKey;
        if (quickKey !== 'custom') {
            const t = this.quickGenPeriodTimeInfo(quickKey);
            this.dispatchEvent('time-changed', t, true);
            return;
        }
        this.dispatchEvent(
            'time-changed',
            {
                tzOffset: this.tzOffset,
                start: this.startTime as Date,
                end: this.endTime as Date,
                type: 'custom'
            },
            true
        );
    });
    private _onRadioChange = (e: Event) => {
        if (!(e.target instanceof HTMLInputElement)) return;
        if (e.target.type !== 'radio') return;
        const { name, value } = e.target;
        if (name === 'radio') {
            const v = value as QuickKey;
            if (v === 'custom') return;
            this.quickKey = v;
        } else if (name === 'tz') {
            this.tzOffset = +value;
        }
    };
    private _onDoneBtnClick = (_e: Event) => {
        const selector = this._els.periodSelector;
        selector.abortSelecting();
        this._showMenu('top');
        let { timeStart, timeEnd } = selector;
        if (timeStart > timeEnd) [timeStart, timeEnd] = [timeEnd, timeStart];
        this.startTime = timeStart;
        this.endTime = timeEnd;
        this.quickKey = 'custom';
        this._dispatchTimeChangeEvent();
    };

    public readonly genPeriodTimes = (options: GenPeriodTimesOptions) =>
        genPeriodTimes({ weekStartAt: this.weekStartAt, ...options });
    public readonly quickGenPeriodTimes = <T extends DataLimit = DataLimit>(
        periods: T[]
    ) => quickGenPeriodTimes({ weekStartAt: this.weekStartAt, periods });
    public readonly quickGenPeriodTime = <T extends DataLimit = DataLimit>(
        period: T
    ) => quickGenPeriodTime(period, { weekStartAt: this.weekStartAt });
    public readonly quickGenPeriodTimeInfo = <T extends DataLimit = DataLimit>(
        type: T
    ) =>
        quickGenPeriodTimeInfo(
            type,
            { weekStartAt: this.weekStartAt },
            this.tzOffset
        );
}

Ele.define();
