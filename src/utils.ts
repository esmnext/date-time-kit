import {  kitContent, kitDate, kitDateTime, kitOption, kitTime, timeString, Lang } from "*";
import { Granularity } from './enum';
import i18n from "./i18n";

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

export function debounce(fn: Function) {
    let timer: any;
    return function () {
        clearTimeout(timer);
        timer = setTimeout(() => {
            
            fn();
        }, 10);
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
    if ( date === undefined ) {
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

export function getTimeStr (hour: number, minute: number, second: number, millisecond: number): string {

    return `${getTimeStringInSeconds(hour, minute, second)}.${millisecond.toString().padStart(3, '0')}`;
}
export function getTimeStringInSeconds (hour: number, minute: number, second: number): string {

    return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}:${second.toString().padStart(2, '0')}`;
}


export function getTimeString(date: kitDate, time: kitTime): timeString {
    return `${getDateTimeStr(date.year, date.month, date.date)} ${getTimeStr(time.hour, time.minute, time.second, time.millisecond)}` as timeString;
}


export function getTimeStringByTimestamp(timestamp: number): timeString {
    const date = new Date(timestamp);  
    return `${getDateTimeStr(date.getFullYear(), date.getMonth() + 1, date.getDate())} ${getTimeStr(date.getHours(), date.getMinutes(), date.getSeconds(), date.getMilliseconds())}` as timeString;
}


/**
 * dataFactory
 *
 * @description init data for the kit according to kitOpiton
 * @param kitOpiton {kitOption} - options for the kit
 * @returns {kitContent} - data for the kit
 */
export function dataFactory(kitOpiton: kitOption): kitContent {

    let { maxTime, minTime, startTime, endTime } = kitOpiton;
    let temTime = maxTime;
    maxTime = minTime;
    minTime = temTime;
    
    if ( kitOpiton.timeZone !== undefined ) {
        const currentTimeZone = getCurrentTimeZone();
        maxTime && (maxTime = getTimeStringByTimeZone(maxTime, currentTimeZone, kitOpiton.timeZone));
        minTime && (minTime = getTimeStringByTimeZone(minTime, currentTimeZone, kitOpiton.timeZone));
        startTime && (startTime = getTimeStringByTimeZone(startTime, currentTimeZone, kitOpiton.timeZone));
        endTime && (endTime = getTimeStringByTimeZone(endTime, currentTimeZone, kitOpiton.timeZone));
    }
    // console.log('startTime', startTime);
    // console.log('endTime', endTime);

    let maxDate = new Date(maxTime|| Date.now());
    maxDate.setFullYear(maxDate.getFullYear() + (maxTime? 0 : 5));

    let minDate = new Date(minTime || Date.now());
    minDate.setFullYear(minDate.getFullYear() - (minTime ? 0 : 20));


    let startDate = new Date(startTime || Date.now());
    let endDate = new Date(endTime|| Date.now());

    // if end time month equal start time month to show month
    let startDateShow = new Date(startTime || Date.now());
    let endDateShow = new Date(endTime|| Date.now());
    if ( startDate.getUTCFullYear() === endDate.getUTCFullYear() && startDateShow.getMonth() == endDate.getMonth() ) {
        endDateShow.setMonth(endDate.getMonth() + 1);
    }

    // init time zone
    let timeZone = 0;
    if (kitOpiton.timeZone !== undefined) {
        timeZone = kitOpiton.timeZone;
    } else {
        // get current time zone
        timeZone = -new Date().getTimezoneOffset() / 60;
    }

    // default enable zone
    if ( kitOpiton.enableZone === undefined ) {
        kitOpiton.enableZone = true;
    }

    kitOpiton.lang  = kitOpiton.lang  || 'enUS';
    kitOpiton.lang  = kitOpiton.lang.replace(/\-/, '') as Lang;
    if ( 
        !i18n[kitOpiton.lang] 
    ) {
        kitOpiton.lang = 'enUS';
    }
    return {
        startDate: startTime ? initDate(startDate) : initDate(),
        endDate: endTime? initDate(endDate) : initDate(),
        startTime: startTime ? initTime(startDate) : initTime(),
        endTime: endTime? initTime(endDate) : initTime(),
        startDateShow: initDate(startDateShow),
        endDateShow: initDate(endDateShow),
        moveDate: initDate(),
        maxDate: initDate(minDate),
        maxTime: initTime(minDate),
        minDate: initDate(maxDate),
        minTime: initTime(maxDate),
        lang: kitOpiton.lang || 'enUS',
        timeZone,
        granularity: kitOpiton.granularity || Granularity.day,
        enableZone: kitOpiton.enableZone
    }
}

    /**
     * Convert a Date object to a kitDate object.
     * If the date parameter is undefined, it will return a kitDate object with all fields set to 0.
     * @param date The Date object to convert.
     * @returns A kitDate object.
     */
function initDate(date: Date | undefined = undefined): kitDate {
    if ( !date ) {
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
    if ( !date ) {
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

    if ( currentTimeZone === undefined ) {
        currentTimeZone = localTimeZone;
    }
    if (targetTimeZone === undefined) {
        targetTimeZone = currentTimeZone;
    }

    const result = new Date(date.getTime() +  (currentTimeZone * 60 * 60 * 1000) - (targetTimeZone * 60 * 60 * 1000));
    return result;
}

export function getKitTimeyTimeZone(datatime: kitDateTime, timeZone: number): kitDateTime {
    if (timeZone === undefined) {
        timeZone = getCurrentTimeZone();
    }
    let result = new Date(datatime.date.year, datatime.date.month - 1, datatime.date.date,
         datatime.time.hour, datatime.time.minute, datatime.time.second, datatime.time.millisecond);
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
    datatime: timeString, 
    targetTimeZone: number | undefined, 
    currentTimeZone?: number | undefined): timeString {

    if (targetTimeZone === undefined) {
        targetTimeZone = getCurrentTimeZone();
    }
    if (currentTimeZone === undefined) {
        currentTimeZone = getCurrentTimeZone();
   
    }
    
    let result = new Date(datatime);
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