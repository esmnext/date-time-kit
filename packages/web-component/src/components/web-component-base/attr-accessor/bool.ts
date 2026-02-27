import type { AttrAccessor } from './types';

export const booleanAttr = <This extends HTMLElement = HTMLElement>(
    attrName: string
): AttrAccessor<boolean> => ({
    attrName,
    get(this: This): boolean {
        return this.hasAttribute(attrName);
    },
    set(this: This, value: boolean) {
        this.toggleAttribute(attrName, !!value);
    }
});
