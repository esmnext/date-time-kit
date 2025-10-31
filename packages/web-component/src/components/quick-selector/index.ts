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
         * 例如设置为 'minute'，则表示只能选择到分钟，秒和毫秒将被忽略。
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

    protected _style = styleStr;
    protected _template = html;

    private get _periodSelector() {
        return this.shadowRoot!.querySelector(
            'dt-period-selector'
        ) as PeriodSelectorEle;
    }
    private get _popoverEle() {
        return this.shadowRoot!.querySelector('dt-popover') as PopoverEle;
    }

    constructor() {
        super();
        this._applyTemplate();
    }

    public connectedCallback() {
        if (!super.connectedCallback()) return;
        this._renderTz();
        this._updateRadio();
        this._updatePeriodSelector();
        this._popoverEle.addEventListener('open-change', this._onPopoverChange);
        popEleAttrSync2Parent(this, this._popoverEle);
        this.shadowRoot!.querySelector('.tz-trigger')?.addEventListener(
            'click',
            this._onTzTriggerClick
        );
        this.shadowRoot!.querySelector('.custom-trigger')?.addEventListener(
            'click',
            this._onCustomTriggerClick
        );
        this.shadowRoot!.querySelector('.menu.tz .title svg')?.addEventListener(
            'click',
            this._onBackBtnClick
        );
        this.shadowRoot!.querySelector(
            '.menu.custom .title svg'
        )?.addEventListener('click', this._onBackBtnClick);
        this.shadowRoot!.querySelectorAll('.menu').forEach((menu) => {
            menu.addEventListener('change', this._onRadioChange);
        });
        this.shadowRoot!.querySelector('#reset')?.addEventListener(
            'click',
            this._updatePeriodSelector
        );
        this.shadowRoot!.querySelector('#done')?.addEventListener(
            'click',
            this._onDoneBtnClick
        );
    }
    public disconnectedCallback() {
        if (!super.disconnectedCallback()) return;
        this._popoverEle.removeEventListener(
            'open-change',
            this._onPopoverChange
        );
        clearupPopEleAttrSync2Parent(this);
        this.shadowRoot!.querySelector('.tz-trigger')?.removeEventListener(
            'click',
            this._onTzTriggerClick
        );
        this.shadowRoot!.querySelector('.custom-trigger')?.removeEventListener(
            'click',
            this._onCustomTriggerClick
        );
        this.shadowRoot!.querySelector(
            '.menu.tz .title svg'
        )?.removeEventListener('click', this._onBackBtnClick);
        this.shadowRoot!.querySelector(
            '.menu.custom .title svg'
        )?.removeEventListener('click', this._onBackBtnClick);
        this.shadowRoot!.querySelectorAll('.menu').forEach((menu) => {
            menu.removeEventListener('change', this._onRadioChange);
        });
        this.shadowRoot!.querySelector('#reset')?.removeEventListener(
            'click',
            this._updatePeriodSelector
        );
        this.shadowRoot!.querySelector('#done')?.removeEventListener(
            'click',
            this._onDoneBtnClick
        );
    }

    protected _onAttrChanged(
        name: string,
        oldValue: string | null,
        newValue: string | null
    ) {
        super._onAttrChanged(name, oldValue, newValue);
        if (
            parentPopAttrSync2PopEle(name, oldValue, newValue, this._popoverEle)
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

    private _updatePeriodSelector = debounce(() => {
        this._periodSelector.weekStartAt = this.weekStartAt;
        if (
            this.shadowRoot?.querySelector<HTMLElement>('.menu.custom')?.style
                .display === 'none'
        ) {
            return;
        }
        const ele = this._periodSelector;
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
    }, 0);

    private _renderTz = debounce(() => {
        const tzOffset = this.tzOffset;
        const tzRadios =
            this.shadowRoot!.querySelectorAll<HTMLInputElement>(
                'input[name="tz"]'
            );
        tzRadios!.forEach((radio) => {
            radio.checked = +radio.value === tzOffset;
        });
        this.shadowRoot!.querySelector('.tz-trigger bdo')!.textContent =
            utcText(tzOffset);
    }, 0);
    private _updateRadio = debounce(() => {
        const quickKey = this.quickKey;
        const radio = this.shadowRoot!.querySelector<HTMLInputElement>(
            `input[name="radio"][value="${quickKey}"]`
        );
        radio!.checked = true;
    }, 0);

    private _onPopoverChange = (e: PopoverEvent['open-change']) => {
        if (!(e.target instanceof PopoverEle)) return;
        if (e.detail === false) {
            this._showMenu('top');
        }
    };
    private _showMenu(type: 'top' | 'tz' | 'custom') {
        const menus = this.shadowRoot?.querySelectorAll<HTMLElement>('.menu');
        menus?.forEach((menu) =>
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
        const selector = this._periodSelector;
        selector.abortSelecting();
        this._showMenu('top');
        let { timeStart, timeEnd } = this._periodSelector;
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
