import { debounce } from '../../utils';
import { type Weeks, weekKey } from '../calendar';
import type { Ele as PeriodSelectorEle } from '../period-selector';
import {
    type BaseAttrs,
    type Emit2EventMap,
    UiBase
} from '../web-component-base';
import styleStr from './index.css';
import html, { getCurrentTz, utcText } from './index.html';
import type { QuickKey } from './quick-key';

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
    'time-changed':
        | {
              type: 'all';
              start?: null;
              end?: null;
          }
        | {
              type: QuickKey;
              start: Date;
              end: Date;
          };
}
export type EventMap = Emit2EventMap<Emits>;

const genDateWithHours = (
    isStart: boolean,
    fn = (_t: Date) => {},
    t = new Date()
) => {
    if (isStart) t.setHours(0, 0, 0, 0);
    else t.setHours(23, 59, 59, 999);
    fn(t);
    return t;
};
const genStartDate = (fn?: (_t: Date) => void, t?: Date) =>
    genDateWithHours(true, fn, t);
const genEndDate = (fn?: (_t: Date) => void, t?: Date) =>
    genDateWithHours(false, fn, t);
export const genPeriodTimes = (
    startFn?: (_t: Date, weekOffset: number) => void,
    endFn?: (_t: Date, weekOffset: number) => void,
    t: Date = new Date(),
    weekStartAt: Weeks = 'sun'
) => {
    const weekOffset = weekKey.indexOf(weekStartAt);
    return {
        start: genStartDate((t) => startFn?.(t, weekOffset), new Date(t)),
        end: genEndDate((t) => endFn?.(t, weekOffset), new Date(t))
    };
};
const quickPeriodTimes = (weekStartAt: Weeks = 'sun') =>
    ({
        all: null,
        today: genPeriodTimes(),
        yesterday: genPeriodTimes(
            (t) => t.setDate(t.getDate() - 1),
            (t) => t.setDate(t.getDate() - 1)
        ),
        week: genPeriodTimes(
            (t, weekOffset) => t.setDate(t.getDate() - t.getDay() + weekOffset),
            (t, weekOffset) =>
                t.setDate(t.getDate() - t.getDay() + weekOffset + 6)
        ),
        lastWeek: genPeriodTimes(
            (t, weekOffset) =>
                t.setDate(t.getDate() - t.getDay() + weekOffset - 7),
            (t, weekOffset) =>
                t.setDate(t.getDate() - t.getDay() + weekOffset - 1)
        ),
        last7Days: genPeriodTimes((t) => t.setDate(t.getDate() - 6)),
        month: genPeriodTimes(
            (t) => t.setDate(1),
            (t) => t.setMonth(t.getMonth() + 1, 0)
        ),
        last30Days: genPeriodTimes((t) => t.setDate(t.getDate() - 29)),
        last180Days: genPeriodTimes((t) => t.setDate(t.getDate() - 179)),
        last6Month: genPeriodTimes(
            (t) => t.setMonth(t.getMonth() - 5, 1),
            (t) => t.setMonth(t.getMonth() + 1, 0)
        ),
        year: genPeriodTimes(
            (t) => t.setMonth(0, 1),
            (t) => t.setFullYear(t.getFullYear() + 1, 0, 0)
        )
    }) as const;

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
            const defaultPeriod = quickPeriodTimes(this.weekStartAt).last30Days;
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

    private _showMenu(type: 'top' | 'tz' | 'custom') {
        const menus = this.shadowRoot?.querySelectorAll<HTMLElement>('.menu');
        menus?.forEach(
            (menu) =>
                (menu.style.display = menu.classList.contains(type)
                    ? ''
                    : 'none')
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
            const t = quickPeriodTimes(this.weekStartAt)[v];
            this.dispatchEvent(
                'time-changed',
                !t
                    ? { type: 'all' }
                    : {
                          ...t,
                          type: v
                      },
                true
            );
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

    public readonly genPeriodTimes = (
        startFn?: (_t: Date, weekOffset: number) => void,
        endFn?: (_t: Date, weekOffset: number) => void,
        t: Date = new Date()
    ) => {
        return genPeriodTimes(startFn, endFn, t, this.weekStartAt);
    };
}

Ele.define();
