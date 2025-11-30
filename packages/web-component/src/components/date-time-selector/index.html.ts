import { html } from '../../utils';
import { Ele as PopoverEle } from '../popover';
PopoverEle.define();
import { Ele as YyyyMmNavEle } from '../yyyymm-nav';
YyyyMmNavEle.define();
import { Ele as CalendarBaseEle } from '../calendar';
CalendarBaseEle.define();
import { Ele as HhMmSsMsSelector } from '../hhmmss-ms-list-grp/selector';
HhMmSsMsSelector.define();
import { Ele as YyyyMmDdSelector } from '../yyyymmdd-list-grp/selector';
YyyyMmDdSelector.define();
import { GranType } from './common';

export default html`<div class="host-wrapper" data-type="${GranType.CalendarTime}">
<dt-popover part="popover">
  <slot slot="trigger" name="trigger" data-type="${GranType.CalendarTime} ${GranType.Calendar}">
    <button>select date and time</button>
  </slot>
  <div slot="pop" class="wrapper" part="pop">
    <dt-yyyymm-nav
      show-ctrl-btn-month-add
      show-ctrl-btn-month-sub
    ></dt-yyyymm-nav>
    <dt-calendar-base></dt-calendar-base>
    <dt-hhmmss-ms-selector></dt-hhmmss-ms-selector>
  </div>
</dt-popover>
<dt-hhmmss-ms-selector class="timeOnly"><slot data-type="${GranType.Time}"></slot></dt-hhmmss-ms-selector>
<dt-yyyymmdd-selector><slot data-type="${GranType.Date}"></slot></dt-yyyymmdd-selector>
</div>`;
