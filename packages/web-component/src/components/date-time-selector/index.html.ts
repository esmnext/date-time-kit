import { html } from '../../utils';
import { Ele as PopoverEle } from '../popover';
PopoverEle.define();
import { Ele as YyyyMmNavEle } from '../yyyymm-nav';
YyyyMmNavEle.define();
import { Ele as CalendarBaseEle } from '../calendar';
CalendarBaseEle.define();
import { Ele as HhMmSsMsSelector } from '../hhmmss-ms-list-grp/selector';
HhMmSsMsSelector.define();

export default html`
<dt-popover part="popover">
    <slot slot="trigger" name="trigger"><button>select date and time</button></slot>
    <div slot="pop" class="wrapper menu" part="pop">
        <dt-yyyymm-nav
            show-ctrl-btn-month-add
            show-ctrl-btn-month-sub
        ></dt-yyyymm-nav>
        <dt-calendar-base></dt-calendar-base>
        <dt-hhmmss-ms-selector></dt-hhmmss-ms-selector>
    </div>
</dt-popover>
`;
