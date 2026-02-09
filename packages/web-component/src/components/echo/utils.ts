import {
    type DateGranularity,
    type DateTimeGranularity,
    type TimeGranularity,
    getCurrentTzOffsetMs,
    granHelper
} from '../../utils';

type FormatterFn<Gran> = (
    time: Date,
    granularity: {
        max: Gran;
        min: Gran;
    },
    isSmall?: boolean
) => string;

export type DateFormatterFn = FormatterFn<DateGranularity>;
export const defaultDateFormatter: DateFormatterFn = (time, { min, max }) => {
    const s = time.toLocaleDateString('en-GB');
    const idx = {
        year: [6, 10],
        month: [3, 5],
        day: [0, 2]
    };
    if (!granHelper.isDateGran(max)) max = 'year';
    if (!granHelper.isDateGran(min)) min = 'day';
    return s.slice(idx[min][0], idx[max][1]);
};

export type TimeFormatterFn = FormatterFn<TimeGranularity>;
export const defaultTimeFormatter: TimeFormatterFn = (time, { min, max }) => {
    const t = new Date(+time - getCurrentTzOffsetMs()).toISOString();
    const idx = {
        hour: [11, 13],
        minute: [14, 16],
        second: [17, 19],
        millisecond: [20, 23]
    };
    if (!granHelper.isTimeGran(max)) max = 'hour';
    if (!granHelper.isTimeGran(min)) min = 'millisecond';
    return t.slice(idx[max][0], idx[min][1]);
};

export type DatetimeFormatterFn = FormatterFn<DateTimeGranularity>;
export const defaultDatetimeFormatter: DatetimeFormatterFn = (
    time,
    { min, max }
) => {
    const datePart = defaultDateFormatter(time, {
        max: granHelper.toDateGran(max),
        min: 'day'
    });
    const timePart = defaultTimeFormatter(time, {
        max: 'hour',
        min: granHelper.toTimeGran(min)
    });
    return `${datePart} ${timePart}`;
};

export const defaultFormatter = {
    date: defaultDateFormatter,
    time: defaultTimeFormatter,
    datetime: defaultDatetimeFormatter
} as const;
