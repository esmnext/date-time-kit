import { html } from '../../utils';
import { Ele as NumListEle } from '../num-list';
NumListEle.define();

export const baseHtml = html`
<div class="cols" part="cols">
    <div class="col hour" part="col hour">
        <span>Hour</span>
        <dt-num-list
            exportparts="container:list-container, item, item-current"
            part="list hour"
            class="hour"
            min-num="0"
            max-num="23"
        ></dt-num-list>
    </div>
    <div class="col minute" part="col minute">
        <span>Minute</span>
        <dt-num-list
            exportparts="container:list-container, item, item-current"
            part="list minute"
            class="minute"
            min-num="0"
            max-num="59"
        ></dt-num-list>
    </div>
    <div class="col second" part="col second">
        <span>Second</span>
        <dt-num-list
            exportparts="container:list-container, item, item-current"
            part="list second"
            class="second"
            min-num="0"
            max-num="59"
        ></dt-num-list>
    </div>
</div>
<label class="ms-input" part="ms-wrapper">
    <span part="ms-label">Millisecond</span>
    <input part="ms-input" id="ms" type="number" class="millisecond" min="0" max="999" step="1" placeholder="000" />
</label>
`;

import { Ele as PopoverEle } from '../popover';
PopoverEle.define();

export const selectorHtml = html`
<dt-popover part="popover">
  <div slot="trigger">
    <i class="time-icon"></i>
    <span class="time-echo">hh:mm:ss.sss</span>
  </div>
  <div slot="pop">
    <h3>Select Time</h3>
    <div class="list-grp">${baseHtml}</div>
    <button>Done</button>
  </div>
</dt-popover>
`;
