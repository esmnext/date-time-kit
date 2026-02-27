import {
    type DateTimeGranularity,
    debounce,
    getCurrentTzOffset,
    granHelper
} from '../../utils';
import { type Weeks, weekKey } from '../calendar';
import type { Ele as PeriodSelectorEle } from '../period-selector';
import {
    MixinPopover,
    Ele as PopoverEle,
    type EventMap as PopoverEvent
} from '../popover';
import {
    type BaseEmits,
    EleMixin,
    type Emit2EventMap,
    UiBase,
    enumAttr,
    intAttr,
    minmaxGranAttr,
    numAttr,
    strArrAttr,
    timeAttr
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
    UTCInfo2LocaleInfo,
    quickKeys,
    weekKey
};

export const granularityList = granHelper.dateTime.list;
export type Granularity = DateTimeGranularity;

const granAttr = minmaxGranAttr(
    ['minGranularity', 'min-granularity'],
    ['maxGranularity', 'max-granularity']
);

export const props = {
    /**
     * Timezone in minutes. For example: UTC+05:45 => `-345`, UTC-01:00 => `60`.
     *
     * @default
     * new Date().getTimezoneOffset() // locale timezone in minutes
     */
    tzOffset: intAttr('tz-offset', { defaultValue: getCurrentTzOffset() }),
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
     * Quick selection key.
     *
     * @default 'all'
     */
    quickKey: enumAttr('quick-key', {
        validValues: quickKeys,
        defaultValue: 'all'
    }),
    /**
     * Start locale time of the quick selection. Only works in custom mode.
     */
    startTime: timeAttr('start-time', { defaultValue: () => 'NaN' }),
    /**
     * End locale time of the quick selection. Only works in custom mode.
     */
    endTime: timeAttr('end-time', { defaultValue: () => 'NaN' }),
    ...granAttr,
    /**
     * 选择器的粒度，表示最小可选的时间单位。默认为 millisecond。
     * 例如设置为 'minute'，则表示只能选择到分钟，秒和毫秒将被忽略。忽略的时间单位视情况重置为 0 或 23 或 59 或 999。
     */
    minGranularity: granAttr.minGranularity,
    /**
     * @deprecated 还未实现，勿用
     */
    maxGranularity: granAttr.maxGranularity,
    /**
     * Exclude some quick selection options.
     *
     * @example
     * ```ts
     * exclude-field="last7Days, last30Days, timezone"
     * ```
     */
    excludeField: strArrAttr('exclude-field', {
        validValues: [...quickKeys, 'timezone'] as const
    })
};

export interface Emits extends BaseEmits {
    'time-changed': PeriodTimeInfo;
    'open-change': boolean;
}
export type EventMap = Emit2EventMap<Emits>;

/**
 * 快速选择下拉选项
 */
export class Ele extends EleMixin(props, {} as Emits, MixinPopover()) {
    public static readonly tagName = 'dt-quick-selector' as const;
    protected static _style = styleStr;
    protected static _template = html;

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
    }

    protected _onAttrChanged(
        name: string,
        oldValue: string | null,
        newValue: string | null
    ) {
        super._onAttrChanged(name, oldValue, newValue);
        if (this._isPopoverAttrKey(name)) return;
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
        if (!Number.isNaN(startTime) && !Number.isNaN(endTime)) {
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
