import { html } from "@/utils";
import { BaseAttrs, DefEle, UiBase } from "@/components/web-component-base";
import styleStr from './index.scss?inline';
import backArrowSvg from '@/assets/back-arrow.svg?raw';
import ArrowRightSvg from '@/assets/arrow-right.svg?raw';

export interface QuickSelectorAttrs extends BaseAttrs {
    /**
     * Timezone in minutes. For example: UTC+05:45 => `345`, UTC-01:00 => `-60`.
     * 
     * @default
     * -new Date().getTimezoneOffset() // local timezone in minutes
     */
    'time-zone'?: number;
}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface QuickSelectorEmit {}

const getCurrentTz = () => -new Date().getTimezoneOffset();

const utcText = (tz: number = getCurrentTz()) => tz >= 0
    ? `UTC+${(~~(tz / 60) + '').padStart(2, '0')}:${(tz % 60 + '').padStart(2, '0')}` as const
    : `UTC-${(~~-(tz / 60) + '').padStart(2, '0')}:${(-tz % 60 + '').padStart(2, '0')}` as const;

const genTzRadio = (tz: number) => html`<label><input type="radio" name="tz" value="${tz}"/><span>${utcText(tz)}</span></label>`;

/**
 * 快速选择下拉选项
 */
@DefEle('quick-selector')
export default class QuickSelector extends UiBase<QuickSelectorAttrs, QuickSelectorEmit> {
    static get observedAttributes(): string[] {
        return [
            ...(super.observedAttributes as (keyof BaseAttrs)[]),
            'time-zone',
        ] satisfies (keyof QuickSelectorAttrs)[];
    }

    protected _style = styleStr;
    protected _template = html`
<div class="menu top"
    ><div class="radio-grp">${['all', 'today', 'yesterday', 'week', 'lastWeek', 'last7Days', 'month', 'last30Days', 'last180Days', 'last6Month', 'year']
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
><div class="menu tz" style="display:none;"
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
><div class="menu custom" style="display:none;"
    ><div class="title"
        >${backArrowSvg}<span>Custom</span
    ></div
    ><dt-period-selector></dt-period-selector
    ><div class="btns"
        ><button id="reset">Reset</button
        ><button id="done">Done</button
    ></div
></div>`;

    constructor() {
        super();
        this._applyTemplate();
    }

    public connectedCallback() {
        if (!super.connectedCallback()) return;
        this.shadowRoot!.querySelector('.tz-trigger')?.addEventListener('click', this._onTzTriggerClick);
        this.shadowRoot!.querySelector('.custom-trigger')?.addEventListener('click', this._onCustomTriggerClick);
        this.shadowRoot!.querySelector('.menu.tz .title svg')?.addEventListener('click', this._onBackBtnClick);
        this.shadowRoot!.querySelector('.menu.custom .title svg')?.addEventListener('click', this._onBackBtnClick);
    }
    public disconnectedCallback() {
        if (!super.disconnectedCallback()) return;
        this.shadowRoot!.querySelector('.tz-trigger')?.removeEventListener('click', this._onTzTriggerClick);
        this.shadowRoot!.querySelector('.custom-trigger')?.removeEventListener('click', this._onCustomTriggerClick);
        this.shadowRoot!.querySelector('.menu.tz .title svg')?.removeEventListener('click', this._onBackBtnClick);
        this.shadowRoot!.querySelector('.menu.custom .title svg')?.removeEventListener('click', this._onBackBtnClick);
    }

    protected _onAttrChanged(name: string, oldValue: string, newValue: string) {
        super._onAttrChanged(name, oldValue, newValue);
    }

    private _onTzTriggerClick = () => {
        if (!this.isConnected) return;
        const menuTop = this.shadowRoot!.querySelector<HTMLElement>('.menu.top');
        if (menuTop) menuTop.style.display = 'none';
        const menuTz = this.shadowRoot!.querySelector<HTMLElement>('.menu.tz');
        if (menuTz) menuTz.style.display = '';
    };
    private _onCustomTriggerClick = () => {
        if (!this.isConnected) return;
        const menuTop = this.shadowRoot!.querySelector<HTMLElement>('.menu.top');
        if (menuTop) menuTop.style.display = 'none';
        const menuCustom = this.shadowRoot!.querySelector<HTMLElement>('.menu.custom');
        if (menuCustom) menuCustom.style.display = '';
    };
    private _onBackBtnClick = () => {
        if (!this.isConnected) return;
        const menuTop = this.shadowRoot!.querySelector<HTMLElement>('.menu.top');
        if (menuTop) menuTop.style.display = '';
        const menuTz = this.shadowRoot!.querySelector<HTMLElement>('.menu.tz');
        if (menuTz) menuTz.style.display = 'none';
        const menuCustom = this.shadowRoot!.querySelector<HTMLElement>('.menu.custom');
        if (menuCustom) menuCustom.style.display = 'none';
    };
}
