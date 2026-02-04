import { html } from '../../utils';
import { Ele as NumListEle } from '../num-list';
NumListEle.define();

export const baseHtml = html`
<div class="cols" part="cols">
  <div class="col year" part="col year">
    <span part="col label year"><dt-i18n i18n-key="timeUnit.year"></dt-i18n></span>
    <dt-num-list class="year" part="list year"></dt-num-list>
  </div>
  <div class="col month" part="col month">
    <span part="col label month"><dt-i18n i18n-key="timeUnit.month"></dt-i18n></span>
    <dt-num-list class="month" min-num="1" max-num="12" part="list month"></dt-num-list>
  </div>
  <div class="col day" part="col day">
    <span part="col label day"><dt-i18n i18n-key="timeUnit.day"></dt-i18n></span>
    <dt-num-list class="day" min-num="1" max-num="31" part="list day"></dt-num-list>
  </div>
</div>
`;

export const selectorHtml = html`
<dt-popover part="popover" strategy="absolute" placement="bottom">
  <slot name="trigger" slot="trigger">
    <div class="date-trigger" part="trigger">
      <i class="date-icon"></i>
      <span class="date-echo">dd/mm/yyyy</span>
    </div>
  </slot>
  <div slot="pop" part="pop">
    <h3><slot name="title"><dt-i18n i18n-key="date.singleTitle"></dt-i18n></slot></h3>
    <div class="list-grp">${baseHtml}</div>
    <slot name="footer"></slot>
    <button><dt-i18n i18n-key="box.confirm"></dt-i18n></button>
  </div>
</dt-popover>
`;
