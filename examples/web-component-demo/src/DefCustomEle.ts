// https://cn.vuejs.org/guide/extras/web-components#non-vue-web-components-and-typescript

import type { EmitFn, HTMLAttributes, PublicProps } from 'vue';

type EventMap = {
    [event: string]: Event;
};

// 这将 EventMap 映射到 Vue 的 $emit 类型期望的格式
type VueEmit<T extends EventMap> = EmitFn<{
    [K in keyof T]: (event: T[K]) => void;
}>;

// 我们可以为每个需要定义的元素重复使用这个类型助手
export type DefineCustomElement<
    ElementType extends HTMLElement,
    Attrs extends Record<string, any> = {},
    Events extends EventMap = {}
> = new () => ElementType & {
    // 使用 $props 定义暴露给模板类型检查的属性
    // Vue 特别从 `$props` 类型读取属性定义
    // 请注意，我们将元素的属性与全局 HTML 属性和 Vue 的特殊属性结合在一起
    /** @deprecated 不要在自定义元素引用上使用 $props 属性，
      这仅用于模板属性类型检查 */
    $props: HTMLAttributes & Attrs & PublicProps;

    // 使用 $emit 专门定义事件类型
    // Vue 特别从 `$emit` 类型读取事件类型
    // 请注意，`$emit` 期望我们将 `Events` 映射到特定格式
    /** @deprecated 不要在自定义元素引用上使用 $emit 属性，
      这仅用于模板属性类型检查 */
    $emit: VueEmit<Events>;
};

import { DtPopover, DtQuickSelector } from '@date-time-kit/web-component';

export type DtPopoverEvent = DtPopover.EventMap;
export type DtQuickSelectorEvent = DtQuickSelector.EventMap;

// 将新元素类型添加到 Vue 的 GlobalComponents 类型中
declare module 'vue' {
    interface GlobalComponents {
        [DtPopover.Ele.tagName]: DefineCustomElement<
            DtPopover.Ele,
            DtPopover.Attrs,
            DtPopover.EventMap
        >;
        [DtQuickSelector.Ele.tagName]: DefineCustomElement<
            DtQuickSelector.Ele,
            DtQuickSelector.Attrs,
            DtQuickSelector.EventMap
        >;
    }
}

export const init = () => {
    DtPopover.Ele.define();
    DtQuickSelector.Ele.define();
};
