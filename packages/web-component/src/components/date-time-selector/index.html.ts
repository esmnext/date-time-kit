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
import { Ele as EchoEle } from '../echo';
EchoEle.define();
import { GranType } from './common';

const popoverShow = `${GranType.Calendar} ${GranType.CalendarTime}`;

export default html`<div class="host-wrapper" data-type="${GranType.CalendarTime}">
<dt-popover data-show="${popoverShow}" part="popover">
  <slot slot="trigger" name="trigger" data-type="${popoverShow}"
    ><dt-echo></dt-echo
  ></slot>
  <div slot="pop" class="wrapper" part="pop">
    <dt-yyyymm-nav data-show="${popoverShow}"
      show-ctrl-btn-month-add
      show-ctrl-btn-month-sub
    ></dt-yyyymm-nav>
    <dt-calendar-base data-show="${popoverShow}"></dt-calendar-base>
    <dt-hhmmss-ms-selector data-show="${GranType.CalendarTime}"></dt-hhmmss-ms-selector>
    <button data-show="${GranType.CalendarTime}" class="confirmBtn" part="confirm-btn"
      ><dt-i18n i18n-key="box.confirm"></dt-i18n
    ></button>
  </div>
</dt-popover>
<dt-hhmmss-ms-selector data-show="${GranType.Time}" class="timeOnly">
  <slot data-type="${GranType.Time}"></slot>
</dt-hhmmss-ms-selector>
<dt-yyyymmdd-selector data-show="${GranType.Date} ${GranType.DateTime}">
  <slot slot="trigger" data-type="${GranType.Date} ${GranType.DateTime}"
    ><dt-echo></dt-echo
  ></slot>
  <dt-hhmmss-ms-selector data-show="${GranType.DateTime}" slot="footer"></dt-hhmmss-ms-selector>
</dt-yyyymmdd-selector>
</div>`;
