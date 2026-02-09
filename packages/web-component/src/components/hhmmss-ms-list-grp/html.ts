import { html } from '../../utils';
import { Ele as NumListEle } from '../num-list';
NumListEle.define();

export const baseHtml = html`
<div class="cols" part="cols">
  <div class="col hour" part="col hour">
    <span><dt-i18n i18n-key="timeUnit.hour"></dt-i18n></span>
    <dt-num-list class="hour" min-num="0" max-num="23"
      exportparts="container:list-container, item, item-current"
      part="list hour"
    ></dt-num-list>
  </div>
  <div class="col minute" part="col minute">
    <span><dt-i18n i18n-key="timeUnit.minute"></dt-i18n></span>
    <dt-num-list class="minute" min-num="0" max-num="59"
      exportparts="container:list-container, item, item-current"
      part="list minute"
    ></dt-num-list>
  </div>
  <div class="col second" part="col second">
    <span><dt-i18n i18n-key="timeUnit.second"></dt-i18n></span>
    <dt-num-list class="second" min-num="0" max-num="59"
      exportparts="container:list-container, item, item-current"
      part="list second"
    ></dt-num-list>
  </div>
</div>
<label class="ms-input" part="ms-wrapper">
  <span part="ms-label"><dt-i18n i18n-key="timeUnit.millisecond"></dt-i18n></span>
  <input part="ms-input" id="ms" type="number" class="millisecond" min="0" max="999" step="1" placeholder="000" />
</label>
`;

import { Ele as PopoverEle } from '../popover';
PopoverEle.define();
import { Ele as EchoEle } from '../echo';
EchoEle.define();

export const selectorHtml = html`
<dt-popover part="popover" strategy="absolute" placement="bottom">
  <slot name="trigger" slot="trigger">
    <dt-echo part="trigger"></dt-echo>
  </slot>
  <div slot="pop" part="pop">
    <h3><slot name="title"><dt-i18n i18n-key="time.singleTitle"></dt-i18n></slot></h3>
    <div class="list-grp">${baseHtml}</div>
    <button><dt-i18n i18n-key="box.confirm"></dt-i18n></button>
  </div>
</dt-popover>
`;
