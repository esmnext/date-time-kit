import { debounce, html } from "@/utils";
import { BaseAttrs, DefEle, UiBase } from "@/components/web-component-base";
import styleStr from './index.scss?inline';
import backArrowSvg from '@/assets/back-arrow.svg?raw';
import ArrowRightSvg from '@/assets/arrow-right.svg?raw';
import { kitDataLimit } from "@/types";
import PeriodSelector from "../period-selector";
import { weekKey, Weeks } from "../calendar";

type QuickKey = kitDataLimit | 'custom';

export interface QuickSelectorAttrs extends BaseAttrs {
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
    'start-time'?: Date | null | 'null';
    /**
     * End time of the quick selection. Only works in custom mode.
     */
    'end-time'?: Date | null | 'null';
}

export interface QuickSelectorEmit {
    'time-changed': 'all' | {
        start: Date;
        end: Date;
        type: QuickKey;
    };
}

const getCurrentTz = () => -new Date().getTimezoneOffset();

const utcText = (tz: number = getCurrentTz()) => tz >= 0
    ? `UTC+${(~~(tz / 60) + '').padStart(2, '0')}:${(tz % 60 + '').padStart(2, '0')}` as const
    : `UTC-${(~~-(tz / 60) + '').padStart(2, '0')}:${(-tz % 60 + '').padStart(2, '0')}` as const;

const genTzRadio = (tz: number) => html`<label><input type="radio" name="tz" value="${tz}"/><span>${utcText(tz)}</span></label>`;

const genDateWithHours = (isStart: boolean, fn = (_t: Date) => {}, t = new Date()) => {
    if (isStart) t.setHours(0, 0, 0, 0);
    else t.setHours(23, 59, 59, 999);
    fn(t);
    return t;
};
const genStartDate = (fn?: (_t: Date) => void, t?: Date) => genDateWithHours(true, fn, t);
const genEndDate = (fn?: (_t: Date) => void, t?: Date) => genDateWithHours(false, fn, t);
const quickPeriodTimes = (weekOffset = 0) => ({
    all: null,
    today: {
        start: genStartDate(),
        end: genEndDate()
    },
    yesterday: {
        start: genStartDate(t => t.setDate(t.getDate() - 1)),
        end: genEndDate(t => t.setDate(t.getDate() - 1))
    },
    week: {
        start: genStartDate(t => t.setDate(t.getDate() - t.getDay() + weekOffset)),
        end: genEndDate(t => t.setDate(t.getDate() - t.getDay() + weekOffset + 6))
    },
    lastWeek: {
        start: genStartDate(t => t.setDate(t.getDate() - t.getDay() + weekOffset - 7)),
        end: genEndDate(t => t.setDate(t.getDate() - t.getDay() + weekOffset - 1))
    },
    last7Days: {
        start: genStartDate(t => t.setDate(t.getDate() - 6)),
        end: genEndDate()
    },
    month: {
        start: genStartDate(t => t.setDate(1)),
        end: genEndDate(t => t.setMonth(t.getMonth() + 1, 0))
    },
    last30Days: {
        start: genStartDate(t => t.setDate(t.getDate() - 29)),
        end: genEndDate()
    },
    last180Days: {
        start: genStartDate(t => t.setDate(t.getDate() - 179)),
        end: genEndDate()
    },
    last6Month: {
        start: genStartDate(t => t.setMonth(t.getMonth() - 5, 1)),
        end: genEndDate(t => t.setMonth(t.getMonth() + 1, 0))
    },
    year: {
        start: genStartDate(t => t.setMonth(0, 1)),
        end: genEndDate(t => t.setFullYear(t.getFullYear() + 1, 0, 0))
    },
} as const);

/**
 * 快速选择下拉选项
 */
@DefEle('quick-selector')
export default class QuickSelector extends UiBase<QuickSelectorAttrs, QuickSelectorEmit> {
    static get observedAttributes(): string[] {
        return [
            ...(super.observedAttributes as (keyof BaseAttrs)[]),
            'time-zone',
            'week-start-at',
            'quick-key',
            'start-time',
            'end-time',
        ] satisfies (keyof QuickSelectorAttrs)[];
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
        if (!['all', 'today', 'yesterday', 'week', 'lastWeek', 'last7Days', 'month', 'last30Days', 'last180Days', 'last6Month', 'year', 'custom'].includes(val)) {
            return;
        }
        this.setAttribute('quick-key', val);
    }
    public get weekStartAt() {
        return this._getAttr('week-start-at', 'sun');
    }
    public set weekStartAt(val: Weeks) {
        if (weekKey.includes(val)) return;
        this.setAttribute('week-start-at', val);
    }


    protected _style = styleStr;
    protected _template = html`
<div class="menu top"
    ><div class="radio-grp">${(['all', 'today', 'yesterday', 'week', 'lastWeek', 'last7Days', 'month', 'last30Days', 'last180Days', 'last6Month', 'year'] as QuickKey[])
            .map(k =>
                html`<label
                    ><input type="radio" name="radio" value="${k}"
                    /><dt-i18n i18n-key="quick.${k}">${k}</dt-i18n
                ></label>`
            ).join('')
        }<label class="custom-trigger"
            ><input type="radio" name="radio" value="custom"
            /><dt-i18n i18n-key="quick.custom">Custom</dt-i18n
            >${ArrowRightSvg
        }</label
    ></div
    ><i class="dividing-line"></i
    ><div class="tz-trigger"
        ><span
            ><dt-i18n i18n-key="quick.timezone"></dt-i18n
            ><bdo>${utcText()}</bdo
        ></span
        >${ArrowRightSvg
        }</div
></div
><div class="menu tz" style="display:none"
    ><div class="title"
        >${backArrowSvg}<span>Time Zone</span
    ></div
    ><fieldset class="subtitle"
        ><legend><dt-i18n i18n-key="quick.recommend"></dt-i18n></legend
    >${[...new Set([getCurrentTz(), 120])].map(genTzRadio).join('')
        }</fieldset
    ><fieldset class="subtitle"
        ><legend><dt-i18n i18n-key="quick.timezoneList"></dt-i18n></legend
        >${[-12, -11, -10, -9.5, -9, -8, -7, -6, -5, -4, -3, -3.5, -2, -1, 0, 1, 2, 3, 3.5, 4, 4.5, 5, 5.5, 5.75, 6, 6.5, 7, 8, 8.75, 9, 9.5, 10, 10.5, 11, 12, 12.45, 13, 14]
            .map(tz => tz === 2 || tz * 60 === getCurrentTz() ? '' : genTzRadio(tz * 60)).join('')
        }</fieldset
    ></div
><div class="menu custom" style="display:none"
    ><div class="title"
        >${backArrowSvg}<span>Custom</span
    ></div
    ><dt-period-selector></dt-period-selector
    ><div class="btns"
        ><button id="reset">Reset</button
        ><button id="done">Done</button
    ></div
></div>`;

    private get _periodSelector() {
        return this.shadowRoot!.querySelector('dt-period-selector') as PeriodSelector;
    }

    constructor() {
        super();
        this._applyTemplate();
    }

    public connectedCallback() {
        if (!super.connectedCallback()) return;
        this._renderTz();
        this._updatePeriodSelector();
        this._updateRadio();
        this.shadowRoot!.querySelector('.tz-trigger')?.addEventListener('click', this._onTzTriggerClick);
        this.shadowRoot!.querySelector('.custom-trigger')?.addEventListener('click', this._onCustomTriggerClick);
        this.shadowRoot!.querySelector('.menu.tz .title svg')?.addEventListener('click', this._onBackBtnClick);
        this.shadowRoot!.querySelector('.menu.custom .title svg')?.addEventListener('click', this._onBackBtnClick);
        this.shadowRoot!.querySelectorAll('.menu').forEach(menu => {
            menu.addEventListener('change', this._onRadioChange);
        });
        this.shadowRoot!.querySelector('#reset')?.addEventListener('click', this._updatePeriodSelector);
        this.shadowRoot!.querySelector('#done')?.addEventListener('click', this._onDoneBtnClick);
    }
    public disconnectedCallback() {
        if (!super.disconnectedCallback()) return;
        this.shadowRoot!.querySelector('.tz-trigger')?.removeEventListener('click', this._onTzTriggerClick);
        this.shadowRoot!.querySelector('.custom-trigger')?.removeEventListener('click', this._onCustomTriggerClick);
        this.shadowRoot!.querySelector('.menu.tz .title svg')?.removeEventListener('click', this._onBackBtnClick);
        this.shadowRoot!.querySelector('.menu.custom .title svg')?.removeEventListener('click', this._onBackBtnClick);
        this.shadowRoot!.querySelectorAll('.menu').forEach(menu => {
            menu.removeEventListener('change', this._onRadioChange);
        });
        this.shadowRoot!.querySelector('#reset')?.removeEventListener('click', this._updatePeriodSelector);
        this.shadowRoot!.querySelector('#done')?.removeEventListener('click', this._onDoneBtnClick);
    }

    protected _onAttrChanged(name: string, oldValue: string, newValue: string) {
        super._onAttrChanged(name, oldValue, newValue);
        if (name === 'time-zone') {
            this._renderTz();
        }
        if (name === 'quick-key') {
            this._updateRadio();
        }
    }

    private _updatePeriodSelector = debounce(() => {
        const defaultPeriod = quickPeriodTimes().last30Days;
        const ele = this._periodSelector;
        ele.timeStart = defaultPeriod.start;
        ele.timeEnd = defaultPeriod.end;
        ele.showCalendarDatePoint();
    }, 0);

    private _renderTz = debounce(() => {
        const tz = this.timezone;
        const tzRadios = this.shadowRoot!.querySelectorAll<HTMLInputElement>('input[name="tz"]');
        tzRadios!.forEach(radio => {
            radio.checked = +radio.value === tz;
        });
        this.shadowRoot!.querySelector('.tz-trigger bdo')!.textContent = utcText(tz);
    }, 0);
    private _updateRadio = debounce(() => {
        const quickKey = this.quickKey;
        const radio = this.shadowRoot!.querySelector<HTMLInputElement>(`input[name="radio"][value="${quickKey}"]`);
        radio!.checked = true;
    }, 0);

    private _showMenu(type: 'top' | 'tz' | 'custom') {
        const menus = this.shadowRoot?.querySelectorAll<HTMLElement>('.menu');
        menus?.forEach(menu => menu.style.display = menu.classList.contains(type) ? '' : 'none');
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
        console.trace('on change');
        if (name === 'radio') {
            const v = value as QuickKey;
            if (v === 'custom') return;
            const t = quickPeriodTimes()[v];
            this.dispatchEvent('time-changed', !t ? 'all' : {
                ...t,
                type: v
            }, true);
        }
        else if (name === 'tz') {
            this.timezone = +value;
        }
    };
    private _onDoneBtnClick = (_e: Event) => {
        const selector = this._periodSelector;
        this._showMenu('top');
        this.shadowRoot!.querySelector<HTMLInputElement>('input[name="radio"][value="custom"]')!.checked = true;
        this.dispatchEvent('time-changed', {
            start: selector.timeStart as Date,
            end: selector.timeEnd as Date,
            type: 'custom'
        }, true);
    };
}
