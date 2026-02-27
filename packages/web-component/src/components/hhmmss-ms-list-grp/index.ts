import { debounce } from '../../utils';
import type { Emit2EventMap } from '../web-component-base';
import { type BaseEmits, MixinHhmmssBaseEle } from './base';

export type { Granularity, ColOrder } from './base';

export interface Emits extends BaseEmits {
    change: {
        oldMs: number;
        newMs: number;
    };
}
export type EventMap = Emit2EventMap<Emits>;

/** 时分秒毫秒选择器 */
export class Ele extends MixinHhmmssBaseEle() {
    public static readonly tagName = 'dt-hhmmss-ms-list-grp';

    protected _onAttrChanged(
        name: string,
        oldValue: string | null,
        newValue: string | null
    ) {
        super._onAttrChanged(name, oldValue, newValue);
        if (name === 'millisecond') {
            this._emitChange(+oldValue! || 0, +newValue! || 0);
        }
    }

    private _emitChange = debounce((oldMs: number, newMs: number) => {
        this.dispatchEvent('change', { oldMs, newMs }, true);
    });
}

Ele.define();
