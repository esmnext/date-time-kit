import type { AttrAccessor } from './types';

export const numAttr = <This extends HTMLElement = HTMLElement>(
    attrName: string,
    {
        defaultValue = 0,
        min = Number.NEGATIVE_INFINITY,
        max = Number.POSITIVE_INFINITY,
        floor = false,
        withoutNaN = false
    }: {
        defaultValue?: number;
        min?: number | ((this: This) => number);
        max?: number | ((this: This) => number);
        floor?: boolean;
        withoutNaN?: boolean;
    } = {}
): AttrAccessor<number, number | string | Date> => ({
    attrName,
    get(this: This): number {
        const v = this.getAttribute(attrName) || '' + defaultValue;
        let n = +v;
        if (floor) n = Math.floor(n);
        if (withoutNaN && Number.isNaN(n)) return defaultValue;
        const minVal = typeof min === 'function' ? min.call(this) : min;
        const maxVal = typeof max === 'function' ? max.call(this) : max;
        return n < minVal ? minVal : n > maxVal ? maxVal : n;
    },
    set(this: This, value: number | string | Date) {
        let n = +value;
        if (withoutNaN && Number.isNaN(n)) return;
        if (floor) n = Math.floor(n);
        const minVal = typeof min === 'function' ? min.call(this) : min;
        const maxVal = typeof max === 'function' ? max.call(this) : max;
        n = Math.min(Math.max(minVal, n), maxVal);
        this.setAttribute(attrName, '' + n);
    }
});

export const intAttr = <This extends HTMLElement = HTMLElement>(
    attrName: string,
    options: Omit<Parameters<typeof numAttr>[1], 'floor'> = {}
) => numAttr(attrName, { floor: true, withoutNaN: true, ...options });

export const minmaxNumAttr = <
    TMinPropName extends string,
    TMaxPropName extends string,
    This extends HTMLElement = HTMLElement
>(
    [minPropName, minAttrName]: [TMinPropName, string],
    [maxPropName, maxAttrName]: [TMaxPropName, string],
    {
        defaultMinValue = Number.NEGATIVE_INFINITY,
        defaultMaxValue = Number.POSITIVE_INFINITY,
        floor = false,
        withoutNaN = false
    }: {
        defaultMinValue?: number;
        defaultMaxValue?: number;
        floor?: boolean;
        withoutNaN?: boolean;
    } = {}
) => {
    const minAttr = numAttr(minAttrName, {
        defaultValue: defaultMinValue,
        floor,
        withoutNaN
    });
    const maxAttr = numAttr(maxAttrName, {
        defaultValue: defaultMaxValue,
        floor,
        withoutNaN
    });
    return {
        [minPropName]: {
            attrName: minAttrName,
            get(this: This) {
                const min = minAttr.get.call(this);
                const max = maxAttr.get.call(this);
                return min > max ? max : min;
            },
            set(this: This, value: number | string | Date) {
                let n = +value;
                if (withoutNaN && Number.isNaN(n)) return;
                if (floor) n = Math.floor(n);
                const max = maxAttr.get.call(this);
                if (n > max) {
                    maxAttr.set!.call(this, n);
                    minAttr.set!.call(this, max);
                } else minAttr.set!.call(this, n);
            }
        },
        [maxPropName]: {
            attrName: maxAttrName,
            get(this: This) {
                const min = minAttr.get.call(this);
                const max = maxAttr.get.call(this);
                return max < min ? min : max;
            },
            set(this: This, value: number | string | Date) {
                let n = +value;
                if (withoutNaN && Number.isNaN(n)) return;
                if (floor) n = Math.floor(n);
                const min = minAttr.get.call(this);
                if (n < min) {
                    minAttr.set!.call(this, n);
                    maxAttr.set!.call(this, min);
                } else maxAttr.set!.call(this, n);
            }
        }
    } as {
        [x in TMinPropName | TMaxPropName]: AttrAccessor<number>;
    };
};

export const minmaxIntAttr = <
    TMinPropName extends string,
    TMaxPropName extends string,
    This extends HTMLElement = HTMLElement
>(
    minPropAttrName: [TMinPropName, string],
    maxPropAttrName: [TMaxPropName, string],
    options: Omit<Parameters<typeof numAttr>[1], 'floor'> = {}
) =>
    minmaxNumAttr(minPropAttrName, maxPropAttrName, {
        floor: true,
        withoutNaN: true,
        ...options
    });

export const clampedNumAttr = <
    TMinPropName extends string,
    TValuePropName extends string,
    TMaxPropName extends string,
    This extends HTMLElement = HTMLElement
>(
    [minPropName, minAttrName]: [TMinPropName, string],
    [valuePropName, valueAttrName]: [TValuePropName, string],
    [maxPropName, maxAttrName]: [TMaxPropName, string],
    {
        defaultMinValue = Number.NEGATIVE_INFINITY,
        defaultMaxValue = Number.POSITIVE_INFINITY,
        defaultValue = 0,
        floor = false,
        withoutNaN = false
    }: {
        defaultMinValue?: number;
        defaultMaxValue?: number;
        defaultValue?: number;
        floor?: boolean;
        withoutNaN?: boolean;
    } = {}
) => {
    const minmaxAttr = minmaxNumAttr(
        [minPropName, minAttrName],
        [maxPropName, maxAttrName],
        { defaultMinValue, defaultMaxValue, floor, withoutNaN }
    );
    const valueAttr = numAttr(valueAttrName, {
        defaultValue,
        floor,
        withoutNaN,
        min() {
            return minmaxAttr[minPropName].get.call(this);
        },
        max() {
            return minmaxAttr[maxPropName].get.call(this);
        }
    });
    return {
        ...minmaxAttr,
        [valuePropName]: valueAttr
    } as {
        [x in
            | TMinPropName
            | TValuePropName
            | TMaxPropName]: AttrAccessor<number>;
    };
};
