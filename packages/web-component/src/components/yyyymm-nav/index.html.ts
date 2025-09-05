import { html } from '../../utils';
import { Ele as PopoverEle } from '../popover';
PopoverEle.define();
import { Ele as YyyyMmDdListGrpEle } from '../yyyymmdd-list-grp';
YyyyMmDdListGrpEle.define();

export default html`
<div class="wrapper">
    <div class="btns sub">
        <i class="btn sub year"></i>
        <i class="btn sub month"></i>
    </div>
    <dt-popover class="echo">
        <div slot="trigger" class="title-wrapper">
            <span class="title">title</span>
            <i class="title-arrow"></i>
        </div>
        <dt-yyyymmdd-list-grp slot="pop" min-granularity="month" part="list-grp"></dt-yyyymmdd-list-grp>
    </dt-popover>
    <div class="btns add">
        <i class="btn add month"></i>
        <i class="btn add year"></i>
    </div>
</div>
`;
