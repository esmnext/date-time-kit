import type { AttrAccessor } from './types';

export const timeAttr = <This extends HTMLElement = HTMLElement>(
    attrName: string,
    {
        defaultValue = () => '' + Date.now(),
        defaultValueFromAttr,
        min = () => Number.NEGATIVE_INFINITY,
        max = () => Number.POSITIVE_INFINITY,
        minAttr,
        maxAttr
    }: {
        defaultValue?: (this: This) => string;
        defaultValueFromAttr?: string;
        min?: (this: This) => number;
        max?: (this: This) => number;
        minAttr?: string;
        maxAttr?: string;
    } = {}
): AttrAccessor<Date, number | string | Date> => ({
    attrName,
    get(this: This): Date {
        const v =
            this.getAttribute(attrName) ||
            (defaultValueFromAttr
                ? this.getAttribute(defaultValueFromAttr)
                : void 0) ||
            defaultValue.call(this);
        const minVal = minAttr
            ? +(this.getAttribute(minAttr) || min.call(this))
            : min.call(this);
        const maxVal = maxAttr
            ? +(this.getAttribute(maxAttr) || max.call(this))
            : max.call(this);
        const n = +new Date(Number.isNaN(+v) ? v : +v);
        return new Date(n < minVal ? minVal : n > maxVal ? maxVal : n);
    },
    set(this: This, value: number | string | Date) {
        const v = new Date(value);
        if (Number.isNaN(+v)) return;
        this.setAttribute(attrName, +v + '');
    }
});

export const minmaxTimeAttr = <
    TMinPropName extends string,
    TMaxPropName extends string,
    This extends HTMLElement = HTMLElement
>(
    [minPropName, minAttrName]: [TMinPropName, string],
    [maxPropName, maxAttrName]: [TMaxPropName, string],
    {
        defaultMinValue = () => 'NaN',
        defaultMaxValue = () => 'NaN'
    }: {
        defaultMinValue?: (this: This) => string;
        defaultMaxValue?: (this: This) => string;
    } = {}
) => {
    const minAttr = timeAttr(minAttrName, { defaultValue: defaultMinValue });
    const maxAttr = timeAttr(maxAttrName, { defaultValue: defaultMaxValue });
    function getMinmax(
        this: This,
        { min = +minAttr.get.call(this), max = +maxAttr.get.call(this) } = {}
    ) {
        if (Number.isNaN(min)) min = Number.NEGATIVE_INFINITY;
        if (Number.isNaN(max)) max = Number.POSITIVE_INFINITY;
        if (min > max) [min, max] = [max, min];
        return { min: new Date(min), max: new Date(max) };
    }
    return {
        [minPropName]: {
            attrName: minAttrName,
            get(this: This) {
                return getMinmax.call(this).min;
            },
            set(this: This, value: number | string | Date) {
                const { min, max } = getMinmax.call(this, {
                    min: +new Date(Number.isNaN(+value) ? value : +value)
                });
                minAttr.set!.call(this, min);
                maxAttr.set!.call(this, max);
            }
        },
        [maxPropName]: {
            attrName: maxAttrName,
            get(this: This) {
                return getMinmax.call(this).max;
            },
            set(this: This, value: number | string | Date) {
                const { min, max } = getMinmax.call(this, {
                    max: +new Date(Number.isNaN(+value) ? value : +value)
                });
                minAttr.set!.call(this, min);
                maxAttr.set!.call(this, max);
            }
        },
        _minmaxTime: {
            get(this: This) {
                return getMinmax.call(this);
            },
            set(
                this: This,
                value: {
                    min?: number | string | Date;
                    max?: number | string | Date;
                }
            ) {
                const { min, max } = getMinmax.call(this, {
                    min:
                        value.min !== void 0
                            ? +new Date(
                                  Number.isNaN(+value.min)
                                      ? value.min
                                      : +value.min
                              )
                            : void 0,
                    max:
                        value.max !== void 0
                            ? +new Date(
                                  Number.isNaN(+value.max)
                                      ? value.max
                                      : +value.max
                              )
                            : void 0
                });
                minAttr.set!.call(this, min);
                maxAttr.set!.call(this, max);
            }
        }
    } as {
        [x in TMinPropName | TMaxPropName]: AttrAccessor<Date>;
    } & {
        /** 获取最小和最大时间的便捷属性 */
        _minmaxTime: AttrAccessor<{ min: Date; max: Date }>;
    };
};

export const clampedTimeAttr = <
    TMinPropName extends string,
    TValuePropName extends string,
    TMaxPropName extends string,
    This extends HTMLElement = HTMLElement
>(
    [minPropName, minAttrName]: [TMinPropName, string],
    [valuePropName, valueAttrName]: [TValuePropName, string],
    [maxPropName, maxAttrName]: [TMaxPropName, string],
    {
        defaultMinValue = () => 'NaN',
        defaultMaxValue = () => 'NaN',
        defaultValue = () => '' + Date.now()
    }: {
        defaultMinValue?: (this: This) => string;
        defaultMaxValue?: (this: This) => string;
        defaultValue?: (this: This) => string;
    } = {}
) => {
    const minmaxAttr = minmaxTimeAttr(
        [minPropName, minAttrName],
        [maxPropName, maxAttrName],
        { defaultMinValue, defaultMaxValue }
    );
    const valueAttr = timeAttr(valueAttrName, {
        defaultValue,
        min() {
            return +minmaxAttr[minPropName].get.call(this);
        },
        max() {
            return +minmaxAttr[maxPropName].get.call(this);
        }
    });
    return {
        ...minmaxAttr,
        [valuePropName]: valueAttr
    } as {
        [x in TMinPropName | TValuePropName | TMaxPropName]: AttrAccessor<Date>;
    } & {
        /** 获取最小和最大时间的便捷属性 */
        _minmaxTime: AttrAccessor<{ min: Date; max: Date }>;
    };
};
