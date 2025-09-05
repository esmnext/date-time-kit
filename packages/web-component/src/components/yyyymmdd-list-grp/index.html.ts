import { html } from '../../utils';
import { Ele as NumListEle } from '../num-list';
NumListEle.define();

export default html`
<div class="cols" part="cols">
    <div class="col year" part="col year">
        <span part="col label year">Year</span>
        <dt-num-list part="list year" class="year"></dt-num-list>
    </div>
    <div class="col month" part="col month">
        <span part="col label month">Month</span>
        <dt-num-list part="list month" class="month" min-num="1" max-num="12"></dt-num-list>
    </div>
    <div class="col day" part="col day">
        <span part="col label day">Day</span>
        <dt-num-list part="list day" class="day" min-num="1" max-num="31"></dt-num-list>
    </div>
</div>
`;
