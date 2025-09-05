import { html } from '../../utils';
import { Ele as PopoverEle } from '../popover';
PopoverEle.define();
import { Ele as YyyyMmNavEle } from '../yyyymm-nav';
YyyyMmNavEle.define();
import { Ele as CalendarBaseEle } from '../calendar';
CalendarBaseEle.define();
import { Ele as HhMmSsMsListGrpEle } from '../hhmmss-ms-list-grp';
HhMmSsMsListGrpEle.define();

export default html`
<dt-popover part="popover">
    <slot slot="trigger" name="trigger"><button>select date and time</button></slot>
    <div slot="pop" class="wrapper menu" part="pop">
        <dt-yyyymm-nav
            show-ctrl-btn-month-add
            show-ctrl-btn-month-sub
        ></dt-yyyymm-nav>
        <dt-calendar-base></dt-calendar-base>
        <dt-popover id="time-popover" part="popover time">
            <div slot="trigger" class="time-echo-wrapper">
                <i class="time-icon"></i>
                <span class="time-echo">hh:mm:ss.sss</span>
            </div>
            <div slot="pop" class="time-selector">
                <h3 class="title">Select Time</h3>
                <dt-hhmmss-ms-list-grp></dt-hhmmss-ms-list-grp>
                <button id="time-selector-done-btn">Done</button>
            </div>
        </dt-popover>
    </div>
</dt-popover>
`;
