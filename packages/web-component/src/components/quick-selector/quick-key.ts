import type { DataLimit } from '../../i18n';
import { getCurrentTzOffset } from '../../utils';
import { type Weeks, weekKey } from '../calendar';

export type { DataLimit };
export type QuickKey = DataLimit | 'custom';

export const limitKeys: DataLimit[] = [
    'all',
    'today',
    'yesterday',
    'week',
    'lastWeek',
    'last7Days',
    'month',
    'last30Days',
    'last90Days',
    'last180Days',
    'last6Month',
    'year'
];
export const quickKeys: QuickKey[] = [...limitKeys, 'custom'];

const genDateWithHours = (
    isStart: boolean,
    fn = (_t: Date) => {},
    t = new Date()
) => {
    if (isStart) t.setHours(0, 0, 0, 0);
    else t.setHours(23, 59, 59, 999);
    fn(t);
    return t;
};

const genStartDate = (fn?: (_t: Date) => void, t?: Date) =>
    genDateWithHours(true, fn, t);

const genEndDate = (fn?: (_t: Date) => void, t?: Date) =>
    genDateWithHours(false, fn, t);

export interface QuickGenPeriodTimesOptions {
    initTime?: Date;
    weekStartAt?: Weeks;
}
export interface GenPeriodTimesOptions extends QuickGenPeriodTimesOptions {
    start?: (time: Date, weekOffset: number) => void;
    end?: (time: Date, weekOffset: number) => void;
}

export const genPeriodTimes = ({
    start,
    end,
    initTime = new Date(),
    weekStartAt = 'sun'
}: GenPeriodTimesOptions = {}) => {
    const weekOffset = weekKey.indexOf(weekStartAt);
    return {
        start: genStartDate((t) => start?.(t, weekOffset), new Date(initTime)),
        end: genEndDate((t) => end?.(t, weekOffset), new Date(initTime))
    };
};

const noop = () => {};

const presetPeriods = {
    all: () => null,
    today: (ops: QuickGenPeriodTimesOptions) =>
        genPeriodTimes({
            ...ops,
            start: noop,
            end: noop
        }),
    yesterday: (ops: QuickGenPeriodTimesOptions) =>
        genPeriodTimes({
            ...ops,
            start: (t) => t.setDate(t.getDate() - 1),
            end: (t) => t.setDate(t.getDate() - 1)
        }),
    week: (ops: QuickGenPeriodTimesOptions) =>
        genPeriodTimes({
            ...ops,
            start: (t, weekOffset) =>
                t.setDate(t.getDate() - t.getDay() + weekOffset),
            end: (t, weekOffset) =>
                t.setDate(t.getDate() - t.getDay() + weekOffset + 6)
        }),
    lastWeek: (ops: QuickGenPeriodTimesOptions) =>
        genPeriodTimes({
            ...ops,
            start: (t, weekOffset) =>
                t.setDate(t.getDate() - t.getDay() + weekOffset - 7),
            end: (t, weekOffset) =>
                t.setDate(t.getDate() - t.getDay() + weekOffset - 1)
        }),
    last7Days: (ops: QuickGenPeriodTimesOptions) =>
        genPeriodTimes({
            ...ops,
            start: (t) => t.setDate(t.getDate() - 6),
            end: noop
        }),
    month: (ops: QuickGenPeriodTimesOptions) =>
        genPeriodTimes({
            ...ops,
            start: (t) => t.setDate(1),
            end: (t) => t.setMonth(t.getMonth() + 1, 0)
        }),
    last30Days: (ops: QuickGenPeriodTimesOptions) =>
        genPeriodTimes({
            ...ops,
            start: (t) => t.setDate(t.getDate() - 29),
            end: noop
        }),
    last90Days: (ops: QuickGenPeriodTimesOptions) =>
        genPeriodTimes({
            ...ops,
            start: (t) => t.setDate(t.getDate() - 89),
            end: noop
        }),
    last180Days: (ops: QuickGenPeriodTimesOptions) =>
        genPeriodTimes({
            ...ops,
            start: (t) => t.setDate(t.getDate() - 179),
            end: noop
        }),
    last6Month: (ops: QuickGenPeriodTimesOptions) =>
        genPeriodTimes({
            ...ops,
            start: (t) => t.setMonth(t.getMonth() - 5, 1),
            end: (t) => t.setMonth(t.getMonth() + 1, 0)
        }),
    year: (ops: QuickGenPeriodTimesOptions) =>
        genPeriodTimes({
            ...ops,
            start: (t) => t.setMonth(0, 1),
            end: (t) => t.setFullYear(t.getFullYear() + 1, 0, 0)
        })
};

export const quickGenPeriodTimes = <T extends DataLimit = DataLimit>({
    periods = limitKeys as T[],
    ...options
}: { periods?: T[] } & QuickGenPeriodTimesOptions = {}) => {
    periods = [...new Set(periods)].filter((k) => k in presetPeriods);
    return Object.fromEntries(
        periods.map((k) => [k, presetPeriods[k](options)])
    ) as Record<Exclude<T, 'all'>, { start: Date; end: Date }> &
        ('all' extends T ? { all: null } : {});
};

export const quickGenPeriodTime = <T extends DataLimit = DataLimit>(
    period: T,
    options: QuickGenPeriodTimesOptions = {}
) =>
    presetPeriods[period](options) as T extends 'all'
        ? null
        : { start: Date; end: Date };

export type PeriodTimeInfo<
    T extends QuickKey = QuickKey,
    RT = Date
> = T extends 'all'
    ? {
          type: 'all';
          /** Locale time */
          start?: null;
          /** Locale time */
          end?: null;
          /** Timezone offset in minutes. e.g. UTC+05:45 => `-345`, UTC-01:00 => `60` */
          tzOffset: number;
      }
    : {
          type: Exclude<T, 'all'>;
          /** Locale time */
          start: RT;
          /** Locale time */
          end: RT;
          /** Timezone offset in minutes. e.g. UTC+05:45 => `-345`, UTC-01:00 => `60` */
          tzOffset: number;
      };

export const quickGenPeriodTimeInfo = <T extends DataLimit = DataLimit>(
    type: T,
    options: QuickGenPeriodTimesOptions = {},
    tzOffset = getCurrentTzOffset()
) => {
    const t = quickGenPeriodTime(type, options);
    return (
        !t ? { type, tzOffset } : { type, ...t, tzOffset }
    ) as PeriodTimeInfo<T>;
};

export const localeInfo2UTCInfo = (info: PeriodTimeInfo) => {
    info = { ...info };
    if (info.type === 'all') return info;
    const { tzOffset, start, end } = info;
    info.start = new Date(
        +start - (getCurrentTzOffset() - tzOffset) * 60 * 1000
    );
    info.end = new Date(+end - (getCurrentTzOffset() - tzOffset) * 60 * 1000);
    return info;
};

export const UTCInfo2LocaleInfo = (info: PeriodTimeInfo) => {
    info = { ...info };
    if (info.type === 'all') return info;
    const { tzOffset, start, end } = info;
    info.start = new Date(
        +start + (getCurrentTzOffset() - tzOffset) * 60 * 1000
    );
    info.end = new Date(+end + (getCurrentTzOffset() - tzOffset) * 60 * 1000);
    return info;
};
