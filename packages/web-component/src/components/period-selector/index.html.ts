import { html } from '../../utils';
import { Ele as YyyyMmNavEle } from '../yyyymm-nav';
YyyyMmNavEle.define();
import { Ele as CalendarBaseEle } from '../calendar';
CalendarBaseEle.define();
import { Ele as PopoverEle } from '../popover';
PopoverEle.define();
import { Ele as HhMmSsMsSelector } from '../hhmmss-ms-list-grp/selector';
HhMmSsMsSelector.define();

export default html`
<div class="date-echo">
    <div class="start-date-echo-wrapper active">
        <span class="label"><dt-i18n i18n-key="time.startDate"></dt-i18n></span>
        <span class="start-date-echo">dd/mm/yyyy</span>
    </div>
    <i class="dividing-line"></i>
    <div class="end-date-echo-wrapper">
        <span class="label"><dt-i18n i18n-key="time.endDate"></dt-i18n></span>
        <span class="end-date-echo">dd/mm/yyyy</span>
    </div>
</div><div class="calendars">${['start', 'end']
    .map(
        (s) => html`
<div class="wrapper ${s}">
    <dt-yyyymm-nav
        show-ctrl-btn-month-add
        show-ctrl-btn-month-sub
    ></dt-yyyymm-nav>
    <dt-calendar-base data-type="${s}"></dt-calendar-base>
    <div class="time-selector-wrapper">
        <dt-hhmmss-ms-selector data-type="${s}">
            <span slot="title"><dt-i18n i18n-key="time.${
                s === 'start' ? 'startTime' : 'endTime'
            }"></dt-i18n></span>
        </dt-hhmmss-ms-selector>
        <i class="dividing-line" style="display:none"></i>
    </div>
</div>`
    )
    .join('')}</div>`;
