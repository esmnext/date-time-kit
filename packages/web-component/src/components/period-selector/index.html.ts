import { html } from '../../utils';
import { Ele as YyyyMmNavEle } from '../yyyymm-nav';
YyyyMmNavEle.define();
import { Ele as CalendarBaseEle } from '../calendar';
CalendarBaseEle.define();
import { Ele as PopoverEle } from '../popover';
PopoverEle.define();
import { Ele as HhMmSsMsListGrpEle } from '../hhmmss-ms-list-grp';
HhMmSsMsListGrpEle.define();

export default html`
<div class="date-echo">
    <div class="start-date-echo-wrapper active">
        <span class="label">Start Date</span>
        <span class="start-date-echo">dd/mm/yyyy</span>
    </div>
    <i class="dividing-line"></i>
    <div class="end-date-echo-wrapper">
        <span class="label">End Date</span>
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
    <dt-popover>
        <div slot="trigger" class="time-echo-wrapper">
            <i class="time-icon"></i>
            <span class="time-echo">hh:mm:ss.sss</span>
        </div>
        <div slot="pop" class="time-selector">
            <h3 class="title">${s === 'start' ? 'Start Time' : 'End Time'}</h3>
            <dt-hhmmss-ms-list-grp></dt-hhmmss-ms-list-grp>
            <button id="time-selector-done-btn" data-type="${s}">Done</button>
        </div>
    </dt-popover>
</div>`
    )
    .join('')}</div>`;
