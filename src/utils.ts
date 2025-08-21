import {
    Granularity,
    kitContent,
    kitDate,
    kitDateTime,
    kitOption,
    kitTime,
    timeString,
    kitDataLimit,
    kitTimestampResult,
} from "./types";
import i18n, { Lang } from "./i18n";
import { getQuickMap } from './components/quick';

export function getLimitKeyByTimestamp(
    startTimestamp: timeString,
    endTimestamp: timeString,
    timeZone?: number
): kitDataLimit | null {
    const currentTimeZone = getCurrentTimeZone();
    if (timeZone === void 0) {
        timeZone = currentTimeZone;
    }

    const startTimeDate = new Date(getTimeStringByTimeZone(startTimestamp, currentTimeZone, timeZone));
    const endTimeDate = new Date(getTimeStringByTimeZone(endTimestamp, currentTimeZone, timeZone));
    const endTime: kitTime = {
        hour: endTimeDate.getHours(),
        minute: endTimeDate.getMinutes(),
        second: endTimeDate.getSeconds(),
        millisecond: endTimeDate.getMilliseconds()
    }
    const startTime: kitTime = {
        hour: startTimeDate.getHours(),
        minute: startTimeDate.getMinutes(),
        second: startTimeDate.getSeconds(),
        millisecond: startTimeDate.getMilliseconds()
    }
    const startDate: kitDate = {
        year: startTimeDate.getFullYear(),
        month: startTimeDate.getMonth() + 1,
        date: startTimeDate.getDate()
    }

    const endDate: kitDate = {
        year: endTimeDate.getFullYear(),
        month: endTimeDate.getMonth() + 1,
        date: endTimeDate.getDate()
    }
    const QUICK_MAP = getQuickMap();
    for (const key in QUICK_MAP) {
        if (!QUICK_MAP[key as keyof typeof QUICK_MAP]) {
            continue;
        }

        if (
            QUICK_MAP[key as keyof typeof QUICK_MAP]?.endTime.hour === endTime.hour &&
            QUICK_MAP[key as keyof typeof QUICK_MAP]?.endTime.minute === endTime.minute &&
            QUICK_MAP[key as keyof typeof QUICK_MAP]?.endTime.second === endTime.second &&
            QUICK_MAP[key as keyof typeof QUICK_MAP]?.endTime.millisecond === endTime.millisecond &&

            QUICK_MAP[key as keyof typeof QUICK_MAP]?.startTime.hour === startTime.hour &&
            QUICK_MAP[key as keyof typeof QUICK_MAP]?.startTime.minute === startTime.minute &&
            QUICK_MAP[key as keyof typeof QUICK_MAP]?.startTime.second === startTime.second &&
            QUICK_MAP[key as keyof typeof QUICK_MAP]?.startTime.millisecond === startTime.millisecond &&

            QUICK_MAP[key as keyof typeof QUICK_MAP]?.startDate.year === startDate.year &&
            QUICK_MAP[key as keyof typeof QUICK_MAP]?.startDate.month === startDate.month &&
            QUICK_MAP[key as keyof typeof QUICK_MAP]?.startDate.date === startDate.date &&

            QUICK_MAP[key as keyof typeof QUICK_MAP]?.endDate.year === endDate.year &&
            QUICK_MAP[key as keyof typeof QUICK_MAP]?.endDate.month === endDate.month &&
            QUICK_MAP[key as keyof typeof QUICK_MAP]?.endDate.date === endDate.date

        ) {
            return key as kitDataLimit;
        }
    }
    return null;
}

/**
 * 
 * @param {kitDataLimit} limitKey
 * @returns {kitTimestampResult}
 * 
 * @description 
 *  limitKey
 *  QUICK_MAP
 *  QUICK_MAP[limitKey]
 *  QUICK_MAP[limitKey].startDate, QUICK_MAP[limitKey].startTime
 *  QUICK_MAP[limitKey].endDate, QUICK_MAP[limitKey].endTime
 *  Date(result.startTime).getTime()
 *  Date(result.endTime).getTime()
 *  kitTimestampResult
 */
export function getTimestampByLimitKey(
    limitKey: kitDataLimit,
    timeZone?: number
): kitTimestampResult {
    const result: kitTimestampResult = {
        startTime: '0000-00-00T00:00:00.000',
        endTime: '0000-00-00T00:00:00.000',
        startTimeStamp: 0,
        endTimeStamp: 0
    }
    const QUICK_MAP = getQuickMap();
    if (!QUICK_MAP[limitKey]) {
        return result;
    }
    if (timeZone === void 0) {
        timeZone = getCurrentTimeZone();
    }

    const startDateTime = getKitTimeByTimeZone({
        date: QUICK_MAP[limitKey].startDate,
        time: QUICK_MAP[limitKey].startTime
    }, timeZone);


    const endDateTime = getKitTimeByTimeZone({
        date: QUICK_MAP[limitKey].endDate,
        time: QUICK_MAP[limitKey].endTime
    }, timeZone);

    result.startTime = getTimeString(startDateTime.date, startDateTime.time);
    result.endTime = getTimeString(endDateTime.date, endDateTime.time);

    // result.startTime = getTimeString(QUICK_MAP[limitKey].startDate, QUICK_MAP[limitKey].startTime);
    // result.endTime = getTimeString(QUICK_MAP[limitKey].endDate, QUICK_MAP[limitKey].endTime);
    result.startTimeStamp = new Date(result.startTime).getTime();
    result.endTimeStamp = new Date(result.endTime).getTime();
    return result;

}

/**
 * Shows the element by adding the "dt-show" class.
 * @param element - Element to be shown.
 */
export function showBox(element: Element) {
    element.classList.add('dt-show');
}


/**
 * Hides the element by removing the "dt-show" class and then removing the element
 * from the DOM after 350ms.
 * @param element - Element to be hidden.
 */
export function hideBox(element: Element) {
    element.classList.remove('dt-show');
    setTimeout(() => {
        element.parentElement!.removeChild(element);
    }, 350);
}



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
    return function () {
        if (timer !== null) clearTimeout(timer);
        timer = setTimeout(() => {
            fn();
        }, delay);
    }
}

/**
 * Format a date as a string in the format "YYYY-MM-DD".
 * If the date parameter is undefined, only the year and month are returned.
 * @param year The year of the date.
 * @param date The date of the month. If undefined, only the year and month are returned.
 * @returns The formatted date string.
 */

export function getDateTimeStr(year: number, month: number, date: number | undefined = undefined): string {
    if (date === undefined) {
        return `${year.toString().padStart(4, '0')}-${month.toString().padStart(2, '0')}`;
    }
    return `${year.toString().padStart(4, '0')}-${month.toString().padStart(2, '0')}-${date.toString().padStart(2, '0')}`;
}


/**
 * Formats the given time parameters into a string with the format "HH:MM:SS:MMM".
 * Each component (hour, minute, second, millisecond) is padded with leading zeros 
 * to ensure a consistent two-digit (for hour, minute, second) or three-digit 
 * (for millisecond) format.
 * 
 * @param hour - The hour component of the time.
 * @param minute - The minute component of the time.
 * @param second - The second component of the time.
 * @param millisecond - The millisecond component of the time.
 * @returns A string representing the formatted time.
 */

export function getTimeStr(hour: number, minute: number, second: number, millisecond: number): string {
    return `${getTimeStringInSeconds(hour, minute, second)}.${millisecond.toString().padStart(3, '0')}`;
}
export function getTimeStringInSeconds(hour: number, minute: number, second: number): string {
    return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}:${second.toString().padStart(2, '0')}`;
}


export function getTimeString(date: kitDate, time: kitTime): timeString {
    return `${getDateTimeStr(date.year, date.month, date.date)}T${getTimeStr(time.hour, time.minute, time.second, time.millisecond)}` as timeString;
}


export function getTimeStringByTimestamp(timestamp: number): timeString {
    const date = new Date(timestamp);
    return `${getDateTimeStr(date.getFullYear(), date.getMonth() + 1, date.getDate())}T${getTimeStr(date.getHours(), date.getMinutes(), date.getSeconds(), date.getMilliseconds())}` as timeString;
}


/**
 * dataFactory
 *
 * @description init data for the kit according to kitOption
 * @param kitOption {kitOption} - options for the kit
 * @returns {kitContent} - data for the kit
 */
export function dataFactory(kitOption: kitOption): kitContent {

    let { maxTime, minTime, startTime, endTime } = kitOption;
    //TODO: 配置名字写反了 临时交换一下
    const temTime = maxTime;
    maxTime = minTime || getTimeStringByTimestamp(Date.now() - 1000 * 60 * 60 * 24 * 365 * 5);
    minTime = temTime || getTimeStringByTimestamp(Date.now() + 1000 * 60 * 60 * 24 * 365 * 20);
    // startTime = startTime || '0000-00-00T00:00:00.000';
    // endTime = endTime || '0000-00-00T00:00:00.000';

    if (kitOption.timeZone !== undefined) {
        const currentTimeZone = getCurrentTimeZone();
        maxTime = maxTime || getTimeStringByTimeZone(maxTime, currentTimeZone, kitOption.timeZone);
        minTime = minTime || getTimeStringByTimeZone(minTime, currentTimeZone, kitOption.timeZone);
        startTime = startTime && getTimeStringByTimeZone(startTime, currentTimeZone, kitOption.timeZone);
        endTime = endTime && getTimeStringByTimeZone(endTime, currentTimeZone, kitOption.timeZone);
    }
    // console.log('startTime', startTime);
    // console.log('endTime', endTime);

    const maxDate = new Date(maxTime || Date.now());
    maxDate.setFullYear(maxDate.getFullYear() + (maxTime ? 0 : 5));

    const minDate = new Date(minTime || Date.now());
    minDate.setFullYear(minDate.getFullYear() - (minTime ? 0 : 20));


    const startDate = new Date(startTime || Date.now());
    const endDate = new Date(endTime || Date.now());

    // if end time month equal start time month to show month
    const startDateShow = new Date(startTime || Date.now());
    const endDateShow = new Date(endTime || Date.now());
    if (startDate.getUTCFullYear() === endDate.getUTCFullYear() && startDateShow.getMonth() == endDate.getMonth()) {
        endDateShow.setMonth(endDate.getMonth() + 1);
    }

    // init time zone
    let timeZone = 0;
    if (kitOption.timeZone !== undefined) {
        timeZone = kitOption.timeZone;
    } else {
        // get current time zone
        timeZone = -new Date().getTimezoneOffset() / 60;
    }

    // default enable zone
    if (kitOption.enableZone === undefined) {
        kitOption.enableZone = true;
    }

    // init language
    kitOption.lang = kitOption.lang || navigator.language as Lang;
    kitOption.lang = kitOption.lang.replace(/-/, '') as Lang;
    if (!i18n[kitOption.lang]) {
        kitOption.lang = 'enUS';
    }

    return {
        startDate: startTime ? initDate(startDate) : initDate(),
        endDate: endTime ? initDate(endDate) : initDate(),
        startTime: startTime ? initTime(startDate) : initTime(),
        endTime: endTime ? initTime(endDate) : initTime(),
        startDateShow: initDate(startDateShow),
        endDateShow: initDate(endDateShow),
        moveDate: initDate(),
        maxDate: initDate(minDate),
        maxTime: initTime(minDate),
        minDate: initDate(maxDate),
        minTime: initTime(maxDate),
        lang: kitOption.lang || 'enUS',
        timeZone,
        granularity: kitOption.granularity || Granularity.day,
        enableZone: kitOption.enableZone,
        period: !!kitOption.period,
        maxLength: kitOption.maxLength || 0,
        minLength: kitOption.minLength || 0,
    }
}

/**
 * Convert a Date object to a kitDate object.
 * If the date parameter is undefined, it will return a kitDate object with all fields set to 0.
 * @param date The Date object to convert.
 * @returns A kitDate object.
 */
function initDate(date: Date | undefined = undefined): kitDate {
    if (!date) {
        return {
            year: 0,
            month: 0,
            date: 0
        }
    }

    return {
        year: date.getFullYear(),
        month: date.getMonth() + 1,
        date: date.getDate()
    }
}

/**
 * Convert a Date object to a kitTime object.
 * If the date parameter is undefined, it will return a kitTime object with all fields set to 0.
 * @param date The Date object to convert.
 * @returns A kitTime object representing the time of the provided Date object.
 */

function initTime(date: Date | undefined = undefined): kitTime {
    if (!date) {
        return {
            hour: 0,
            minute: 0,
            second: 0,
            millisecond: 0
        }
    }
    return {
        hour: date.getHours(),
        minute: date.getMinutes(),
        second: date.getSeconds(),
        millisecond: date.getMilliseconds()
    }
}


export function getCurrentTimeZone(): number {
    return -new Date().getTimezoneOffset() / 60;
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
export function getDateByTimeZone(date: Date, targetTimeZone: number | undefined, currentTimeZone?: number | undefined): Date {
    const localTimeZone = getCurrentTimeZone();

    if (currentTimeZone === undefined) {
        currentTimeZone = localTimeZone;
    }
    if (targetTimeZone === undefined) {
        targetTimeZone = currentTimeZone;
    }

    const result = new Date(date.getTime() + (currentTimeZone * 60 * 60 * 1000) - (targetTimeZone * 60 * 60 * 1000));
    return result;
}

export function getKitTimeByTimeZone(datetime: kitDateTime, timeZone: number): kitDateTime {
    if (timeZone === undefined) {
        timeZone = getCurrentTimeZone();
    }
    let result = new Date(datetime.date.year, datetime.date.month - 1, datetime.date.date,
        datetime.time.hour, datetime.time.minute, datetime.time.second, datetime.time.millisecond);
    result = getDateByTimeZone(result, timeZone);
    return {
        date: {
            year: result.getFullYear(),
            month: result.getMonth() + 1,
            date: result.getDate()
        },
        time: {
            hour: result.getHours(),
            minute: result.getMinutes(),
            second: result.getSeconds(),
            millisecond: result.getMilliseconds()
        }
    }
}

export function getTimeStringByTimeZone(
    datetime: timeString,
    targetTimeZone: number | undefined,
    currentTimeZone?: number | undefined
): timeString {

    if (targetTimeZone === undefined) {
        targetTimeZone = getCurrentTimeZone();
    }
    if (currentTimeZone === undefined) {
        currentTimeZone = getCurrentTimeZone();

    }

    let result = new Date(datetime);
    result = getDateByTimeZone(result, targetTimeZone, currentTimeZone);
    return getTimeString({
        year: result.getFullYear(),
        month: result.getMonth() + 1,
        date: result.getDate()
    }, {
        hour: result.getHours(),
        minute: result.getMinutes(),
        second: result.getSeconds(),
        millisecond: result.getMilliseconds()
    });
}
