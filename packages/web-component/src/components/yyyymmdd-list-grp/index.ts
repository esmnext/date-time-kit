import { EleMixin, type Emit2EventMap } from '../web-component-base';
import { type BaseEmits, MixinYyyymmddBaseEle } from './base';
import { listGrpCss } from './css';

export type { Granularity, ColOrder } from './base';
export { granularityList, colOrderList } from './base';

export interface Emits extends BaseEmits {
    change: {
        oldMs: number;
        newMs: number;
    };
}
export type EventMap = Emit2EventMap<Emits>;

/** 日期选择器 */
export class Ele extends EleMixin({}, {} as Emits, MixinYyyymmddBaseEle()) {
    public static readonly tagName = 'dt-yyyymmdd-list-grp';
    protected static _style = listGrpCss;
}

Ele.define();
