import type { DataLimit } from '../../i18n';
import { css, debounce, html } from '../../utils';
import { Ele as PeriodSelectorEle } from '../period-selector';
import {
    type BaseAttrs,
    type Emit2EventMap,
    UiBase
} from '../web-component-base';
PeriodSelectorEle.define();
import { Ele as I18nEle } from '../i18n';
I18nEle.define();
import { type Weeks, weekKey } from '../calendar';
// import styleStr from './index.scss?inline';
const styleStr = css`
:host {
  width: fit-content;
  display: block;
}

.menu {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 10px 5px;
  font-size: 14px;
  gap: 10px;
  border-radius: 6px;
  border: 1px solid #eee;
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
  background-color: #fff;
}
.menu > * {
  width: 100%;
  box-sizing: border-box;
}

.radio-grp {
  display: flex;
  flex-direction: column;
  gap: 5px;
  width: 100%;
}
.radio-grp > label {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  padding: 5px;
}
.radio-grp > label:hover {
  background-color: #f5f5f5;
}
.radio-grp dt-i18n {
  flex: 1;
}
.radio-grp input {
  margin: 0;
  width: 24px;
  height: 24px;
  cursor: pointer;
}

.arrow-right-icon {
  display: inline-block;
  width: 15px;
  height: 15px;
  background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='17' height='17' fill='currentColor'%3E%3Cpath d='M5.256 1.703a.5.5 0 0 1 .707 0l6.128 6.128a.493.493 0 0 1 .045.05.5.5 0 0 1 .051.752l-6.128 6.128a.5.5 0 0 1-.707-.707l5.774-5.774-5.87-5.87a.5.5 0 0 1 0-.707Z'/%3E%3C/svg%3E") no-repeat center center;
  cursor: pointer;
}

.dividing-line {
  display: block;
  height: 1px;
  width: 100%;
  background-color: #eee;
}

.tz-trigger {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 5px;
  gap: 10px;
  cursor: pointer;
  white-space: nowrap;
}
.tz-trigger:hover {
  background-color: #f5f5f5;
}
.tz-trigger bdo {
  direction: ltr;
}

.title {
  display: flex;
  align-items: center;
  padding: 5px;
  gap: 10px;
  font-weight: 700;
  font-size: 18px;
  box-sizing: border-box;
}
.title svg {
  border: 5px solid transparent;
  border-radius: 50%;
  margin: -5px;
  cursor: pointer;
}
.title svg:hover {
  background-color: #eee;
  border-color: #eee;
}

.menu.tz {
  min-width: 180px;
  max-height: 293px;
  overflow: hidden auto;
}
.menu.tz fieldset {
  width: 100%;
  border: none;
  border-top: 1px solid #eee;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 5px;
}
.menu.tz fieldset legend {
  padding: 0 5px;
  margin-bottom: 5px;
  font-size: 12px;
  line-height: 24px;
  color: #666;
}
.menu.tz label {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  padding: 5px;
}
.menu.tz label:hover {
  background-color: #f5f5f5;
}
.menu.tz input {
  margin: 0;
  width: 24px;
  height: 24px;
  cursor: pointer;
}

button {
  border: none;
  min-height: 40px;
  border-radius: 6px;
  padding: 5px 15px;
  font-size: 16px;
  line-height: 1;
  background-color: #18181B;
  color: #fff;
  font-weight: 500;
  cursor: pointer;
}

.menu.custom {
  padding: 14px;
  gap: 15px;
}
.menu.custom dt-period-selector {
  width: 590px;
}
.menu.custom .btns {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
.menu.custom #reset {
  background-color: #E5E7E8;
  color: #333;
}
`;
// import backArrowSvg from '../../assets/back-arrow.svg?raw';
// import ArrowRightSvg from '../../assets/arrow-right.svg?raw';
const backArrowSvg = html`<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor"><path d="M9.894 5.106a.75.75 0 0 1 0 1.06L4.811 11.25 21 11.25a.75.75 0 0 1 0 1.5l-16.191-.001 5.085 5.085a.75.75 0 0 1-1.06 1.06L2.47 12.53a.75.75 0 0 1 0-1.06l6.364-6.364a.75.75 0 0 1 1.06 0Z"/></svg>`;
const ArrowRightSvg = html`<svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" fill="currentColor"><path d="M5.256 1.703a.5.5 0 0 1 .707 0l6.128 6.128a.493.493 0 0 1 .045.05.5.5 0 0 1 .051.752l-6.128 6.128a.5.5 0 0 1-.707-.707l5.774-5.774-5.87-5.87a.5.5 0 0 1 0-.707Z"/></svg>`;

export type QuickKey = DataLimit | 'custom';

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
    'start-time'?: Date | null | 'null';
    /**
     * End time of the quick selection. Only works in custom mode.
     */
    'end-time'?: Date | null | 'null';
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

const getCurrentTz = () => -new Date().getTimezoneOffset();

const utcText = (tz: number = getCurrentTz()) =>
    tz >= 0
        ? (`UTC+${(~~(tz / 60) + '').padStart(2, '0')}:${((tz % 60) + '').padStart(2, '0')}` as const)
        : (`UTC-${(~~-(tz / 60) + '').padStart(2, '0')}:${((-tz % 60) + '').padStart(2, '0')}` as const);

const genTzRadio = (tz: number) =>
    html`<label><input type="radio" name="tz" value="${tz}"/><span>${utcText(tz)}</span></label>`;

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
const quickPeriodTimes = (weekOffset = 0) =>
    ({
        all: null,
        today: {
            start: genStartDate(),
            end: genEndDate()
        },
        yesterday: {
            start: genStartDate((t) => t.setDate(t.getDate() - 1)),
            end: genEndDate((t) => t.setDate(t.getDate() - 1))
        },
        week: {
            start: genStartDate((t) =>
                t.setDate(t.getDate() - t.getDay() + weekOffset)
            ),
            end: genEndDate((t) =>
                t.setDate(t.getDate() - t.getDay() + weekOffset + 6)
            )
        },
        lastWeek: {
            start: genStartDate((t) =>
                t.setDate(t.getDate() - t.getDay() + weekOffset - 7)
            ),
            end: genEndDate((t) =>
                t.setDate(t.getDate() - t.getDay() + weekOffset - 1)
            )
        },
        last7Days: {
            start: genStartDate((t) => t.setDate(t.getDate() - 6)),
            end: genEndDate()
        },
        month: {
            start: genStartDate((t) => t.setDate(1)),
            end: genEndDate((t) => t.setMonth(t.getMonth() + 1, 0))
        },
        last30Days: {
            start: genStartDate((t) => t.setDate(t.getDate() - 29)),
            end: genEndDate()
        },
        last180Days: {
            start: genStartDate((t) => t.setDate(t.getDate() - 179)),
            end: genEndDate()
        },
        last6Month: {
            start: genStartDate((t) => t.setMonth(t.getMonth() - 5, 1)),
            end: genEndDate((t) => t.setMonth(t.getMonth() + 1, 0))
        },
        year: {
            start: genStartDate((t) => t.setMonth(0, 1)),
            end: genEndDate((t) => t.setFullYear(t.getFullYear() + 1, 0, 0))
        }
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
        if (weekKey.includes(val)) return;
        this.setAttribute('week-start-at', val);
    }

    protected _style = styleStr;
    protected _template = html`
<div class="menu top" part="menu top"
    ><div class="radio-grp">${(
        [
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
            'year'
        ] as QuickKey[]
    )
        .map(
            (k) =>
                html`<label
                    ><input type="radio" name="radio" value="${k}"
                    /><dt-i18n i18n-key="quick.${k}">${k}</dt-i18n
                ></label>`
        )
        .join('')}<label class="custom-trigger"
            ><input type="radio" name="radio" value="custom"
            /><dt-i18n i18n-key="quick.custom">Custom</dt-i18n
            >${ArrowRightSvg}</label
    ></div
    ><i class="dividing-line"></i
    ><div class="tz-trigger"
        ><span
            ><dt-i18n i18n-key="quick.timezone"></dt-i18n
            ><bdo>${utcText()}</bdo
        ></span
        >${ArrowRightSvg}</div
></div
><div class="menu tz" part="menu tz" style="display:none"
    ><div class="title"
        >${backArrowSvg}<span>Time Zone</span
    ></div
    ><fieldset class="subtitle"
        ><legend><dt-i18n i18n-key="quick.recommend"></dt-i18n></legend
    >${[...new Set([getCurrentTz(), 120])].map(genTzRadio).join('')}</fieldset
    ><fieldset class="subtitle"
        ><legend><dt-i18n i18n-key="quick.timezoneList"></dt-i18n></legend
        >${[
            -12, -11, -10, -9.5, -9, -8, -7, -6, -5, -4, -3, -3.5, -2, -1, 0, 1,
            2, 3, 3.5, 4, 4.5, 5, 5.5, 5.75, 6, 6.5, 7, 8, 8.75, 9, 9.5, 10,
            10.5, 11, 12, 12.45, 13, 14
        ]
            .map((tz) =>
                tz === 2 || tz * 60 === getCurrentTz()
                    ? ''
                    : genTzRadio(tz * 60)
            )
            .join('')}</fieldset
    ></div
><div class="menu custom" part="menu custom" style="display:none"
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
    }

    private _updatePeriodSelector = debounce(() => {
        if (
            this.shadowRoot?.querySelector<HTMLElement>('.menu.custom')?.style
                .display === 'none'
        ) {
            return;
        }
        const defaultPeriod = quickPeriodTimes().last30Days;
        const ele = this._periodSelector;
        ele.timeStart = defaultPeriod.start;
        ele.timeEnd = defaultPeriod.end;
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
            const t = quickPeriodTimes()[v];
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
        this.shadowRoot!.querySelector<HTMLInputElement>(
            'input[name="radio"][value="custom"]'
        )!.checked = true;
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
}

Ele.define();
