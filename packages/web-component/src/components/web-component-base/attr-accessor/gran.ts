import type {
    DateGranularity,
    DateTimeGranularity,
    TimeGranularity
} from '../../../utils';
import { type YMGranularity, granHelper } from '../../../utils/granularity';
import { enumAttr } from './enum';
import type { AttrAccessor } from './types';

type GranType = 'date' | 'time' | 'dateTime' | 'ym';
type GranByType<T extends GranType> = T extends 'date'
    ? DateGranularity
    : T extends 'time'
      ? TimeGranularity
      : T extends 'dateTime'
        ? DateTimeGranularity
        : T extends 'ym'
          ? YMGranularity
          : never;

export const minmaxGranAttr = <
    TMinPropName extends string,
    TMaxPropName extends string,
    TGran extends GranType,
    This extends HTMLElement = HTMLElement
>(
    [minPropName, minAttrName]: [TMinPropName, string],
    [maxPropName, maxAttrName]: [TMaxPropName, string],
    type: TGran = 'dateTime' as TGran,
    {
        defaultMinValue = granHelper[type].list[0] as GranByType<TGran>,
        defaultMaxValue = granHelper[type].list[
            granHelper[type].list.length - 1
        ] as GranByType<TGran>
    }: {
        defaultMinValue?: GranByType<TGran>;
        defaultMaxValue?: GranByType<TGran>;
    } = {}
) => {
    const minAttr = enumAttr<GranByType<TGran>, This>(minAttrName, {
        validValues: granHelper[type].map as any,
        defaultValue: defaultMinValue
    });
    const maxAttr = enumAttr<GranByType<TGran>, This>(maxAttrName, {
        validValues: granHelper[type].map as any,
        defaultValue: defaultMaxValue
    });
    function getMinmax(
        this: This,
        { min = minAttr.get.call(this), max = maxAttr.get.call(this) } = {}
    ) {
        [min, max] = granHelper.minmax(min, max) as [
            GranByType<TGran>,
            GranByType<TGran>
        ];
        return { min, max };
    }
    return {
        [minPropName]: {
            attrName: minAttrName,
            get(this: This) {
                return getMinmax.call(this).min;
            },
            set(this: This, value: GranByType<TGran>) {
                const { min, max } = getMinmax.call(this, { min: value });
                minAttr.set!.call(this, min);
                maxAttr.set!.call(this, max);
            }
        },
        [maxPropName]: {
            attrName: maxAttrName,
            get(this: This) {
                return getMinmax.call(this).max;
            },
            set(this: This, value: GranByType<TGran>) {
                const { min, max } = getMinmax.call(this, { max: value });
                minAttr.set!.call(this, min);
                maxAttr.set!.call(this, max);
            }
        },
        _minmaxGran: {
            get(this: This) {
                return getMinmax.call(this);
            },
            set(
                this: This,
                value: { min: GranByType<TGran>; max: GranByType<TGran> }
            ) {
                const { min, max } = getMinmax.call(this, value);
                minAttr.set!.call(this, min);
                maxAttr.set!.call(this, max);
            }
        }
    } as {
        [x in TMinPropName | TMaxPropName]: AttrAccessor<GranByType<TGran>>;
    } & {
        /** 获取最小和最大粒度的便捷属性 */
        _minmaxGran: AttrAccessor<{
            min: GranByType<TGran>;
            max: GranByType<TGran>;
        }>;
    };
};
