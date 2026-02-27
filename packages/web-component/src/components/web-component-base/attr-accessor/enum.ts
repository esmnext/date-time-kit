import type { AttrAccessor } from './types';

export const enumAttr = <
    T extends string,
    This extends HTMLElement = HTMLElement
>(
    attrName: string,
    {
        validValues,
        defaultValue
    }: {
        validValues: Map<T, any> | Iterable<T>;
        defaultValue: T;
    }
): AttrAccessor<T> => {
    const enumSet =
        validValues instanceof Map
            ? new Set(validValues.keys())
            : new Set(validValues);
    return {
        attrName,
        get(this: This): T {
            const v = this.getAttribute(attrName);
            return enumSet.has(v as T) ? (v as T) : defaultValue;
        },
        set(this: This, value: T) {
            if (!enumSet.has(value)) return;
            this.setAttribute(attrName, value);
        }
    };
};
