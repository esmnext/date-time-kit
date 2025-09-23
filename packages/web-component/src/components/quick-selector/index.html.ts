import { getCurrentTz, html } from '../../utils';
import { Ele as PeriodSelectorEle } from '../period-selector';
import { type QuickKey, limitKeys } from './quick-key';
PeriodSelectorEle.define();
import { Ele as I18nEle } from '../i18n';
I18nEle.define();

import { arrowRightSvg, backArrowSvg } from '../../assets';

export { getCurrentTz };

export const utcText = (tz: number = getCurrentTz()) =>
    tz >= 0
        ? (`UTC+${(~~(tz / 60) + '').padStart(2, '0')}:${((tz % 60) + '').padStart(2, '0')}` as const)
        : (`UTC-${(~~-(tz / 60) + '').padStart(2, '0')}:${((-tz % 60) + '').padStart(2, '0')}` as const);

const genTzRadio = (tz: number) =>
    html`<label><input type="radio" name="tz" value="${tz}" hidden/><i class="radio"></i><span>${utcText(tz)}</span></label>`;

export default html`
<dt-popover part="popover">
<slot name="trigger" slot="trigger"><input type="button" value="quick selector"/></slot>
<div class="menu top" part="menu top" slot="pop"
    ><div class="radio-grp">${limitKeys
        .map(
            (k) =>
                html`<label
                    ><input type="radio" name="radio" value="${k}" hidden
                    /><i class="radio"></i><dt-i18n i18n-key="quick.${k}">${k}</dt-i18n
                ></label>`
        )
        .join('')}<label class="custom-trigger"
            ><input type="radio" name="radio" value="custom" hidden
            /><i class="radio"></i><dt-i18n i18n-key="quick.custom" style="display:inline-block">Custom</dt-i18n
            >${arrowRightSvg}</label
    ></div
    ><i class="dividing-line"></i
    ><div class="tz-trigger"
        ><span
            ><dt-i18n i18n-key="quick.timezoneWithColon"></dt-i18n
            ><bdo>${utcText()}</bdo
        ></span
        >${arrowRightSvg}</div
></div
><div class="menu tz" part="menu tz"
    ><div class="title"
        >${backArrowSvg}<span><dt-i18n i18n-key="quick.timezone"></dt-i18n></span
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
><div class="menu custom" part="menu custom"
    ><div class="title"
        >${backArrowSvg}<span><dt-i18n i18n-key="quick.custom" style="display:inline-block">Custom</dt-i18n></span
    ></div
    ><dt-period-selector></dt-period-selector
    ><div class="btns"
        ><button id="reset"><dt-i18n i18n-key="box.reset"></dt-i18n></button
        ><button id="done"><dt-i18n i18n-key="box.confirm"></dt-i18n></button
    ></div
></div>
</dt-popover>`;
