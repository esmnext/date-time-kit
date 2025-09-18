import type { DataLimit } from '../../i18n';
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
    'last180Days',
    'last6Month',
    'year'
];

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

export type GenPeriodTimesOptions = {
    start?: (time: Date, weekOffset: number) => void;
    end?: (time: Date, weekOffset: number) => void;
    initTime?: Date;
    weekStartAt?: Weeks;
};

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

const presetPeriods = {
    all: () => null,
    today: (ops: GenPeriodTimesOptions) => genPeriodTimes(ops),
    yesterday: (ops: GenPeriodTimesOptions) =>
        genPeriodTimes({
            ...ops,
            start: (t) => t.setDate(t.getDate() - 1),
            end: (t) => t.setDate(t.getDate() - 1)
        }),
    week: (ops: GenPeriodTimesOptions) =>
        genPeriodTimes({
            ...ops,
            start: (t, weekOffset) =>
                t.setDate(t.getDate() - t.getDay() + weekOffset),
            end: (t, weekOffset) =>
                t.setDate(t.getDate() - t.getDay() + weekOffset + 6)
        }),
    lastWeek: (ops: GenPeriodTimesOptions) =>
        genPeriodTimes({
            ...ops,
            start: (t, weekOffset) =>
                t.setDate(t.getDate() - t.getDay() + weekOffset - 7),
            end: (t, weekOffset) =>
                t.setDate(t.getDate() - t.getDay() + weekOffset - 1)
        }),
    last7Days: (ops: GenPeriodTimesOptions) =>
        genPeriodTimes({
            ...ops,
            start: (t) => t.setDate(t.getDate() - 6)
        }),
    month: (ops: GenPeriodTimesOptions) =>
        genPeriodTimes({
            ...ops,
            start: (t) => t.setDate(1),
            end: (t) => t.setMonth(t.getMonth() + 1, 0)
        }),
    last30Days: (ops: GenPeriodTimesOptions) =>
        genPeriodTimes({
            ...ops,
            start: (t) => t.setDate(t.getDate() - 29)
        }),
    last180Days: (ops: GenPeriodTimesOptions) =>
        genPeriodTimes({
            ...ops,
            start: (t) => t.setDate(t.getDate() - 179)
        }),
    last6Month: (ops: GenPeriodTimesOptions) =>
        genPeriodTimes({
            ...ops,
            start: (t) => t.setMonth(t.getMonth() - 5, 1),
            end: (t) => t.setMonth(t.getMonth() + 1, 0)
        }),
    year: (ops: GenPeriodTimesOptions) =>
        genPeriodTimes({
            ...ops,
            start: (t) => t.setMonth(0, 1),
            end: (t) => t.setFullYear(t.getFullYear() + 1, 0, 0)
        })
};

export const quickPeriodTimes = <T extends DataLimit = DataLimit>({
    weekStartAt = 'sun',
    periods = limitKeys as T[],
    initTime = new Date()
}: {
    weekStartAt?: Weeks;
    periods?: T[];
    initTime?: Date;
} = {}) => {
    periods = [...new Set(periods)].filter((k) => k in presetPeriods);
    return Object.fromEntries(
        periods.map((k) => [
            k,
            presetPeriods[k]({
                weekStartAt,
                initTime
            })
        ])
    ) as Record<Exclude<T, 'all'>, { start: Date; end: Date }> &
        ('all' extends T ? { all: null } : {});
};

export const quickPeriodTime = <T extends DataLimit = DataLimit>({
    period,
    weekStartAt = 'sun',
    initTime = new Date()
}: {
    period: T;
    weekStartAt?: Weeks;
    initTime?: Date;
}) =>
    presetPeriods[period]({
        weekStartAt,
        initTime
    }) as T extends 'all' ? null : { start: Date; end: Date };
