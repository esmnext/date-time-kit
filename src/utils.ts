import {
    Granularity,
    HhMmSs,
    HhMmSsMs,
    kitContent,
    kitDate,
    kitDateTime,
    kitOption,
    kitTime,
    timeString,
    YyyyMm,
    YyyyMmDd,
} from "./types";
import i18n, { Lang } from "./i18n";

export const html = (strings: TemplateStringsArray, ...values: unknown[]) =>
    String.raw(strings, ...values);

/**
 * Shows the element by adding the "dt-show" class.
 * @param element - Element to be shown.
 */
export const showBox = (element: Element) => element.classList.add('dt-show');
/**
 * Hides the element by removing the "dt-show" class and then removing the element
 * from the DOM.
 * @param element - Element to be hidden.
 * @param removeDelay - Delay in milliseconds before the element is removed from the DOM.
 */
export const hideBox = (element: Element, removeDelay = 350) => {
    element.classList.remove('dt-show');
    setTimeout(() => {
        element.parentElement?.removeChild(element);
    }, removeDelay);
};

export const closestByEvent = (e: Event, selector: string, root?: HTMLElement | ShadowRoot) => {
    for (const target of e.composedPath()) {
        if (target === root) return null;
        if (!(target instanceof HTMLElement)) continue;
        if (target.matches(selector)) {
            return target;
        }
    }
    return null;
};

/**
 * Returns a debounced version of the provided function, ensuring that the 
 * function is only invoked after a specified delay in milliseconds has elapsed 
 * since the last time the debounced function was invoked.
 * 
 * @param fn - The function to debounce.
 * @returns A debounced version of the provided function.
 */
// eslint-disable-next-line
export function debounce(fn: Function, delay = 10) {
    let timer: ReturnType<typeof setTimeout> | null = null;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return function <U>(this: U, ...args: any[]) {
        if (timer !== null) clearTimeout(timer);
        timer = setTimeout(() => {
            fn.apply(this, args);
        }, delay);
    }
}
export function Debounce<
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    This, Args extends any[], Return,
    Fn extends (this: This, ...args: Args) => Return
>(delay: number = 0) {
    return function (
        target: Fn,
        _ctx: ClassMethodDecoratorContext<This, Fn>
    ) {
        return debounce(target, delay) as Fn;
    };
}

export const getCurrentTimeZone = () => -new Date().getTimezoneOffset() / 60;

/**
 * Convert a Date object to a kitDate object.
 * If the date parameter is undefined, it will return a kitDate object with all fields set to 0.
 * @param date The Date object to convert.
 * @returns A kitDate object.
 */
export const initKitDate = (date?: Date): kitDate => !date
    ? {
        year: 0,
        month: 0,
        date: 0
    } : {
        year: date.getFullYear(),
        month: date.getMonth() + 1,
        date: date.getDate()
    };

/**
 * Convert a kitDate object to a Date object.
 * @param date The kitDate object to convert.
 * @returns A Date object representing the same date as the kitDate object.
 */
export const kitDate2Date = (date: kitDate) =>
    new Date(date.year, date.month - 1, date.date);

/**
 * Convert a Date object to a kitTime object.
 * If the date parameter is undefined, it will return a kitTime object with all fields set to 0.
 * @param date The Date object to convert.
 * @returns A kitTime object representing the time of the provided Date object.
 */
export const initKitTime = (date?: Date): kitTime => !date
    ? {
        hour: 0,
        minute: 0,
        second: 0,
        millisecond: 0
    } : {
        hour: date.getHours(),
        minute: date.getMinutes(),
        second: date.getSeconds(),
        millisecond: date.getMilliseconds()
    };

export const initKitDateTime = (date?: Date): kitDateTime => ({
    date: initKitDate(date),
    time: initKitTime(date)
});

export const kitDataTime2Date = (datetime: kitDateTime) =>
    new Date(
        datetime.date.year, datetime.date.month - 1, datetime.date.date,
        datetime.time.hour, datetime.time.minute, datetime.time.second, datetime.time.millisecond
    );

/**
 * Format a date as a string in the format "YYYY-MM-DD".
 * If the date parameter is undefined, only the year and month are returned (YYYY-MM).
 * @param year The year of the date.
 * @param month The month of the date (1-12).
 * @param date The date of the month. If undefined, only the year and month are returned.
 * @returns The formatted date string.
 */
export const getDateTimeStr = <
    T extends number | undefined = undefined
>(year: number, month: number, date?: T) =>
    `${year.toString().padStart(4, '0')}-${month.toString().padStart(2, '0')}${date === void 0 ? '' : `-${date.toString().padStart(2, '0')}`
    }` as undefined extends T ? YyyyMm : YyyyMmDd;

export const kitDate2dateStr = (date: kitDate): YyyyMmDd =>
    getDateTimeStr(date.year, date.month, date.date);

export const getTimeStringInSeconds = (hour: number, minute: number, second: number) =>
    `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}:${second.toString().padStart(2, '0')
    }` as HhMmSs;
/**
 * Formats the given time parameters into a string with the format "HH:MM:SS:MMM".
 * Each component (hour, minute, second, millisecond) is padded with leading zeros
 * to ensure a consistent two-digit (for hour, minute, second) or three-digit
 * (for millisecond) format.
 * @param hour - The hour component of the time.
 * @param minute - The minute component of the time.
 * @param second - The second component of the time.
 * @param millisecond - The millisecond component of the time.
 * @returns A string representing the formatted time.
 */
export const getTimeStr = (hour: number, minute: number, second: number, millisecond: number) =>
    `${getTimeStringInSeconds(hour, minute, second)}.${millisecond.toString().padStart(3, '0')}` as HhMmSsMs;

export const kitTime2timeStr = <T extends true | undefined = undefined>(time: kitTime, withoutMs?: T) => (
    withoutMs
        ? getTimeStringInSeconds(time.hour, time.minute, time.second)
        : getTimeStr(time.hour, time.minute, time.second, time.millisecond)
) as undefined extends T ? HhMmSsMs : HhMmSs;

export const kitDateAndTime2timeStr = (date: kitDate, time: kitTime): timeString =>
    `${getDateTimeStr(date.year, date.month, date.date)}T${getTimeStr(time.hour, time.minute, time.second, time.millisecond)}`;

export function getTimeStringByTimestamp(timestamp: number): timeString {
    const date = new Date(timestamp);
    return `${getDateTimeStr(date.getFullYear(), date.getMonth() + 1, date.getDate())}T${getTimeStr(date.getHours(), date.getMinutes(), date.getSeconds(), date.getMilliseconds())}`;
}


/**
 * init data for the kit according to kitOption
 * @param opts {kitOption} - options for the kit
 * @returns {kitContent} - data for the kit
 */
export function dataFactory(opts: kitOption): kitContent {
    let { maxTime, minTime, startTime, endTime } = opts;
    const now = Date.now();
    // TODO: 配置名字写反了 临时交换一下（不单单是这个函数，全局都写反了）
    const temTime = maxTime;
    maxTime = minTime || getTimeStringByTimestamp(now - 1000 * 60 * 60 * 24 * 365 * 5);
    minTime = temTime || getTimeStringByTimestamp(now + 1000 * 60 * 60 * 24 * 365 * 20);

    if (opts.timeZone !== void 0) {
        const currentTimeZone = getCurrentTimeZone();
        maxTime = maxTime || getTimeStringByTimeZone(maxTime, currentTimeZone, opts.timeZone);
        minTime = minTime || getTimeStringByTimeZone(minTime, currentTimeZone, opts.timeZone);
        startTime = startTime && getTimeStringByTimeZone(startTime, currentTimeZone, opts.timeZone);
        endTime = endTime && getTimeStringByTimeZone(endTime, currentTimeZone, opts.timeZone);
    }

    const maxDate = new Date(maxTime || now);
    maxDate.setFullYear(maxDate.getFullYear() + (maxTime ? 0 : 5));

    const minDate = new Date(minTime || now);
    minDate.setFullYear(minDate.getFullYear() - (minTime ? 0 : 20));


    const startDate = new Date(startTime || now);
    const endDate = new Date(endTime || now);

    // if end time month equal start time month to show month
    const startDateShow = new Date(startTime || now);
    const endDateShow = new Date(endTime || now);
    if (startDate.getUTCFullYear() === endDate.getUTCFullYear() && startDateShow.getMonth() == endDate.getMonth()) {
        endDateShow.setMonth(endDate.getMonth() + 1);
    }

    // init time zone
    const timeZone = opts.timeZone !== void 0
        ? opts.timeZone
        : getCurrentTimeZone();

    // default enable zone
    if (opts.enableZone === void 0) {
        opts.enableZone = true;
    }

    // init language
    opts.lang ||= navigator.language as Lang;
    if (!i18n[opts.lang]) {
        opts.lang = 'en-US';
    }

    return {
        startDate: startTime ? initKitDate(startDate) : initKitDate(),
        endDate: endTime ? initKitDate(endDate) : initKitDate(),
        startTime: startTime ? initKitTime(startDate) : initKitTime(),
        endTime: endTime ? initKitTime(endDate) : initKitTime(),
        startDateShow: initKitDate(startDateShow),
        endDateShow: initKitDate(endDateShow),
        moveDate: initKitDate(),
        maxDate: initKitDate(minDate),
        maxTime: initKitTime(minDate),
        minDate: initKitDate(maxDate),
        minTime: initKitTime(maxDate),
        lang: opts.lang || 'en-US',
        timeZone,
        granularity: opts.granularity || Granularity.day,
        enableZone: opts.enableZone,
        period: !!opts.period,
        maxLength: opts.maxLength || 0,
        minLength: opts.minLength || 0,
    };
}


/**
 * Converts a Date object from its current timezone to a different timezone.
 *
 * This function takes a Date object and returns a new Date object with the same date and time,
 * but with a different timezone. If the timeZone parameter is undefined, the function will use
 * the current timezone.
 *
 * @param date The Date object to convert.
 * @param timeZone The number of hours to offset the timezone. If undefined, it will use the current timezone.
 * @returns A new Date object with the same date and time as the original, but in the specified timezone.
 */
export const getDateByTimeZone = (
    date: Date,
    targetTimeZone = getCurrentTimeZone(),
    currentTimeZone = getCurrentTimeZone(),
) => new Date(date.getTime() + (currentTimeZone * 60 * 60 * 1000) - (targetTimeZone * 60 * 60 * 1000));

export function getKitTimeByTimeZone(
    datetime: kitDateTime,
    timeZone = getCurrentTimeZone()
): kitDateTime {
    let result = kitDataTime2Date(datetime);
    result = getDateByTimeZone(result, timeZone);
    return initKitDateTime(result);
}

export function getTimeStringByTimeZone(
    datetime: timeString,
    targetTimeZone = getCurrentTimeZone(),
    currentTimeZone = getCurrentTimeZone()
): timeString {
    const result = getDateByTimeZone(new Date(datetime), targetTimeZone, currentTimeZone);
    return kitDateAndTime2timeStr(initKitDate(result), initKitTime(result));
}
