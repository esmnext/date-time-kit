import {
    type BaseEmits,
    type EleCtor,
    EleMixin,
    UiBase
} from '../web-component-base';
import { Ele as PopoverEle, props } from './ele';

type OriProps = typeof props;

export const mixinProps = Object.fromEntries(
    Object.entries(props).map(([key, value]) => [
        `dtPop${key[0].toUpperCase() + key.slice(1)}`,
        value.attrName ? { ...value, attrName: `pop-${value.attrName}` } : value
    ])
) as {
    [K in keyof OriProps as `dtPop${Capitalize<K>}`]: OriProps[K];
};

// 气泡属性（pop- 前缀）
const popAttrKeys = new Set(['pop-open', 'pop-disabled']);

// Popover 属性（带 pop- 前缀）
const popWrapperAttrKeys = new Set(
    Object.values(mixinProps)
        .map((prop) => prop.attrName)
        .filter(Boolean) as string[]
);

export declare class TPopoverMixinEle {
    /** 是否在属性变化时将当前元素的 pop 属性自动同步到 dt-popover。缺省为 true */
    protected _autoSyncPopAttrAtAttrChange: boolean;
    /** 判断是否为 Popover 属性键（带 `pop-` 前缀） */
    protected _isPopoverAttrKey(name: string): boolean;
    /**
     * 当前元素属性变化同步到 dt-popover（入参的 name 需要带 `pop-` 前缀）。
     * 如果 `_autoSyncPopAttrAtAttrChange` 为 true，则在属性变化时自动调用该函数
     */
    protected _syncPopAttrToPopEle(name: string, newValue: string | null): void;
}

export const MixinPopover = <B extends typeof UiBase = typeof UiBase>(
    BaseEle: B = UiBase as B
) => {
    class PopoverMixinEle extends EleMixin(
        mixinProps,
        {} as BaseEmits,
        BaseEle
    ) {
        get _staticEls() {
            return {
                ...super._staticEls,
                _dtPopover: this.$0<PopoverEle>`dt-popover`!
            } as const;
        }
        protected _autoSyncPopAttrAtAttrChange = true;
        /** 判断是否为 Popover 属性键（带 `pop-` 前缀） */
        protected _isPopoverAttrKey(name: string): boolean {
            return popWrapperAttrKeys.has(name);
        }
        public connectedCallback() {
            if (!super.connectedCallback()) return;
            const ele = this._els._dtPopover;
            if (!ele)
                throw new Error(
                    'dt-popover element not found in the shadow DOM.'
                );
            // dt-popover 属性变化同步到当前元素（加上 `pop-` 前缀）
            this._bindEvt(ele)('dt-attribute-changed', (evt) => {
                if (!(evt.target instanceof PopoverEle)) return;
                const { name, oldValue, newValue } = evt.detail;
                if (newValue === oldValue || !popAttrKeys.has(name)) return;
                if (newValue === null) this.removeAttribute('pop-' + name);
                else this.setAttribute('pop-' + name, newValue);
            });
        }
        protected _syncPopAttrToPopEle(name: string, newValue: string | null) {
            if (!this._isPopoverAttrKey(name)) return;
            const ele = this._els._dtPopover;
            if (!ele) return;
            name = name.replace(/^pop-/, '');
            if (newValue === null) ele.removeAttribute(name);
            else ele.setAttribute(name, newValue);
        }
        protected _onAttrChanged(
            name: string,
            oldValue: string | null,
            newValue: string | null
        ) {
            super._onAttrChanged(name, oldValue, newValue);
            if (!this._autoSyncPopAttrAtAttrChange) return;
            this._syncPopAttrToPopEle(name, newValue);
        }
    }
    return PopoverMixinEle as unknown as B & EleCtor<UiBase & TPopoverMixinEle>;
};
