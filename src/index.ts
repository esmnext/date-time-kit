
import * as box from './components/box';
import './index.scss';
import { kitContent, kitDate, kitOption, kitResult, kitTime } from '../type';


/**
 * open
 *
 * @description open the kit and return the data
 * @param kitOpiton {kitOption} - options for the kit
 * @returns {Promise<kitContent>} - the data of the kit
 */
export async function open(kitOpiton: kitOption): Promise<kitResult> {
    const element = kitOpiton.root;
    const data = dataFactory(kitOpiton);
    
    return box.create({
        root: element
    }, data);
}



/**
 * dataFactory
 *
 * @description init data for the kit according to kitOpiton
 * @param kitOpiton {kitOption} - options for the kit
 * @returns {kitContent} - data for the kit
 */
function dataFactory(kitOpiton: kitOption): kitContent {

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
