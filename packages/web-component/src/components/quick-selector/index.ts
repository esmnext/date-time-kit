import { debounce } from '../../utils';
import { type Weeks, weekKey } from '../calendar';
import type { Ele as PeriodSelectorEle } from '../period-selector';
import { Ele as PopoverEle, type EventMap as PopoverEvent } from '../popover';
import {
    type BaseAttrs,
    type Emit2EventMap,
    UiBase
} from '../web-component-base';
import styleStr from './index.css';
import html, { getCurrentTz, utcText } from './index.html';
import {
    type DataLimit,
    type GenPeriodTimesOptions,
    type PeriodTimeInfo,
    type QuickGenPeriodTimesOptions,
    type QuickKey,
    genPeriodTimes,
    quickGenPeriodTime,
    quickGenPeriodTimeInfo,
    quickGenPeriodTimes
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
    quickGenPeriodTimeInfo
};

export interface Attrs extends BaseAttrs {
    /**
     * Timezone in minutes. For example: UTC+05:45 => `345`, UTC-01:00 => `-60`.
     *
     * @default
     * -new Date().getTimezoneOffset() // local timezone in minutes
     */
    'time-zone'?: number;
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
     * Start time of the quick selection. Only works in custom mode.
     */
    'start-time'?: string | number | '';
    /**
     * End time of the quick selection. Only works in custom mode.
     */
    'end-time'?: string | number | '';
}

export interface Emits {
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
            'time-zone',
            'week-start-at',
            'quick-key',
            'start-time',
            'end-time'
        ] satisfies (keyof Attrs)[];
    }

    public get timezone() {
        return +this._getAttr('time-zone', '' + getCurrentTz());
    }
    public set timezone(v: number) {
        if (!Number.isSafeInteger(v)) return;
        this.setAttribute('time-zone', '' + v);
    }
    public get quickKey() {
        return this._getAttr('quick-key', 'all');
    }
    public set quickKey(val: QuickKey) {
        if (
            ![
                'all',
                'today',
                'yesterday',
                'week',
                'lastWeek',
                'last7Days',
                'month',
                'last30Days',
                'last180Days',
                'last6Month',
                'year',
                'custom'
            ].includes(val)
        ) {
            return;
        }
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
        this.setAttribute('time-start', +v + '');
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
        this.setAttribute('time-end', +v + '');
    }

    protected _style = styleStr;
    protected _template = html;

    private get _periodSelector() {
        return this.shadowRoot!.querySelector(
            'dt-period-selector'
        ) as PeriodSelectorEle;
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
        this.shadowRoot!.querySelector<PopoverEle>(
            'dt-popover'
        )?.addEventListener('open-change', this._onPopoverChange);
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
        this.shadowRoot!.querySelector<PopoverEle>(
            'dt-popover'
        )?.removeEventListener('open-change', this._onPopoverChange);
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

    protected _onAttrChanged(name: string, oldValue: string, newValue: string) {
        super._onAttrChanged(name, oldValue, newValue);
        if (name === 'time-zone') {
            this._renderTz();
        }
        if (name === 'quick-key') {
            this._updateRadio();
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
        ele.showCalendarDatePoint();
    }, 0);

    private _renderTz = debounce(() => {
        const tz = this.timezone;
        const tzRadios =
            this.shadowRoot!.querySelectorAll<HTMLInputElement>(
                'input[name="tz"]'
            );
        tzRadios!.forEach((radio) => {
            radio.checked = +radio.value === tz;
        });
        this.shadowRoot!.querySelector('.tz-trigger bdo')!.textContent =
            utcText(tz);
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

    private _onRadioChange = (e: Event) => {
        if (!(e.target instanceof HTMLInputElement)) return;
        if (e.target.type !== 'radio') return;
        const { name, value } = e.target;
        if (name === 'radio') {
            const v = value as QuickKey;
            if (v === 'custom') return;
            const t = this.quickGenPeriodTimeInfo(v);
            this.dispatchEvent('time-changed', t, true);
        } else if (name === 'tz') {
            this.timezone = +value;
        }
    };
    private _onDoneBtnClick = (_e: Event) => {
        const selector = this._periodSelector;
        this._showMenu('top');
        this.quickKey = 'custom';
        this.dispatchEvent(
            'time-changed',
            {
                start: selector.timeStart as Date,
                end: selector.timeEnd as Date,
                type: 'custom'
            },
            true
        );
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
    ) => quickGenPeriodTimeInfo(type, { weekStartAt: this.weekStartAt });
}

Ele.define();
