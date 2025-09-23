import {
    type Attrs as PopoverAttrs,
    Ele as PopoverEle,
    type EventMap as PopoverEvent
} from '.';
import type { BaseAttrs } from '../web-component-base';

export type reExportPopoverAttrs = {
    [K in `pop-${Exclude<keyof PopoverAttrs, keyof BaseAttrs>}`]?: K extends `pop-${infer U}`
        ? U extends keyof PopoverAttrs
            ? PopoverAttrs[U]
            : never
        : never;
};

export const popoverAttrKeys = [
    'pop-disabled',
    'pop-open',
    'pop-placement',
    'pop-strategy',
    'pop-offset'
] as const;

export const parentPopAttrSync2PopEle = (
    name: string,
    oldValue: string | null,
    newValue: string | null,
    popEle: PopoverEle
): name is (typeof popoverAttrKeys)[number] => {
    if (!popoverAttrKeys.includes(name as any)) return false;
    if (oldValue === newValue) return true;
    const key = name.replace('pop-', '') as keyof PopoverAttrs;
    if (newValue === null) popEle.removeAttribute(key);
    else popEle.setAttribute(key, newValue);
    return true;
};

const eleClearupFns = new WeakMap<HTMLElement, () => void>();
export const popEleAttrSync2Parent = (
    parent: HTMLElement,
    popEle: PopoverEle
) => {
    if (eleClearupFns.has(parent)) return;
    const onAttrChanged = (evt: PopoverEvent['dt-attribute-changed']) => {
        if (!(evt.target instanceof PopoverEle)) return;
        const { name, oldValue, newValue } = evt.detail;
        if (newValue === oldValue) return;
        if (newValue === null) parent.removeAttribute('pop-' + name);
        else parent.setAttribute('pop-' + name, newValue);
    };
    popEle.addEventListener('dt-attribute-changed', onAttrChanged);
    const clearup = () => {
        popEle.removeEventListener('dt-attribute-changed', onAttrChanged);
        eleClearupFns.delete(parent);
    };
    eleClearupFns.set(parent, clearup);
};

export const clearupPopEleAttrSync2Parent = (parent: HTMLElement) =>
    eleClearupFns.get(parent)?.();
