import { kitDate, kitTime } from "*";

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

    return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}:${second.toString().padStart(2, '0')}:${millisecond.toString().padStart(3, '0')}`;
}





/**
 * dataFactory
 *
 * @description init data for the kit according to kitOpiton
 * @param kitOpiton {kitOption} - options for the kit
 * @returns {kitContent} - data for the kit
 */
export function dataFactory(kitOpiton: kitOption): kitContent {

    let maxDate = new Date(kitOpiton.maxTime || Date.now());
    maxDate.setFullYear(maxDate.getFullYear() + (kitOpiton.maxTime ? 0 : 5));

    let minDate = new Date(kitOpiton.minTime || Date.now());
    minDate.setFullYear(minDate.getFullYear() - (kitOpiton.minTime ? 0 : 20));


    let startDate = new Date(kitOpiton.startTime || Date.now());
    let endDate = new Date(kitOpiton.endTime || Date.now());

    // if end time month equal start time month to show month
    let startDateShow = new Date(kitOpiton.startTime || Date.now());
    let endDateShow = new Date(kitOpiton.endTime || Date.now());
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

    
    return {
        startDate: kitOpiton.startTime ? initDate(startDate) : initDate(),
        endDate: kitOpiton.endTime ? initDate(endDate) : initDate(),
        startTime: kitOpiton.startTime ? initTime(startDate) : initTime(),
        endTime: kitOpiton.endTime ? initTime(endDate) : initTime(),
        startDateShow: initDate(startDateShow),
        endDateShow: initDate(endDateShow),
        moveDate: initDate(),
        maxDate: initDate(minDate),
        maxTime: initTime(minDate),
        minDate: initDate(maxDate),
        minTime: initTime(maxDate),
        lang: kitOpiton.lang || 'enUS',
        timeZone
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
