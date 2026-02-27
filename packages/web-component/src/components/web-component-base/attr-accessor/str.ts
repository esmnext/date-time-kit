import type { AttrAccessor } from './types';

export const strAttr = <This extends HTMLElement = HTMLElement>(
    attrName: string
): AttrAccessor<string | null> => ({
    attrName,
    get(this: This): string | null {
        return this.getAttribute(attrName);
    },
    set(this: This, value: string | null) {
        if (value === null) {
            this.removeAttribute(attrName);
        } else {
            this.setAttribute(attrName, value);
        }
    }
});

export const strArrAttr = <
    T extends string,
    This extends HTMLElement = HTMLElement
>(
    attrName: string,
    {
        validValues
    }: {
        validValues: Map<T, any> | Iterable<T>;
    }
): AttrAccessor<T[]> => {
    const enumSet =
        validValues instanceof Map
            ? new Set(validValues.keys())
            : new Set(validValues);
    return {
        attrName,
        get(this: This): T[] {
            const v = this.getAttribute(attrName);
            if (!v) return [];
            return v
                .split(',')
                .map((s) => s.trim())
                .filter((s) => enumSet.has(s as T)) as T[];
        },
        set(this: This, value: T[]) {
            value = value.filter((v) => enumSet.has(v as T));
            if (value.length === 0) {
                this.removeAttribute(attrName);
                return;
            }
            this.setAttribute(attrName, value.join(','));
        }
    };
};
