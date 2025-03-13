
import * as box from './components/box';
import './index.scss';
import { kitDataLimit, kitDate, kitOption, kitResult, kitTime, kitTimestampResult, timeString } from '../type';
import { dataFactory } from './utils';
import * as quick from './components/quick';
import * as utils from "./utils";
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


export function getLimitKeyByTimetamp(startTimestamp: timeString, endTimestamp: timeString, timeZone: number | undefined): kitDataLimit | null {
    const currentTimeZone = utils.getCurrentTimeZone();
    if ( !timeZone ) {
        timeZone = currentTimeZone;
    }

    
    const startTimeDate = new Date(utils.getTimeStringByTimeZone(startTimestamp, timeZone, currentTimeZone));
    const endTimeDate = new Date(utils.getTimeStringByTimeZone(endTimestamp, timeZone, currentTimeZone));
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
    const { QUICK_MAP } = quick;
    for ( const key in QUICK_MAP) {
        if ( !QUICK_MAP[key as keyof typeof QUICK_MAP] ) {
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
export function getTimestampByLimitKey(limitKey: kitDataLimit, timeZone: number | undefined): kitTimestampResult {
    const result: kitTimestampResult = {
        startTime: '0000-00-00 00:00:00.000',
        endTime: '0000-00-00 00:00:00.000',
        startTimeStamp: 0,
        endTimeStamp: 0
    }
    const { QUICK_MAP } = quick;
    if ( !QUICK_MAP[limitKey] ) {
        return result;
    }
    if ( !timeZone ) {
        timeZone = utils.getCurrentTimeZone();
    }

    const startDateTime = utils.getKitTimeyTimeZone({
        date: QUICK_MAP[limitKey].startDate,
        time: QUICK_MAP[limitKey].startTime
    }, timeZone);
    const endDateTime = utils.getKitTimeyTimeZone({
        date: QUICK_MAP[limitKey].endDate,
        time: QUICK_MAP[limitKey].endTime
    }, timeZone);

    result.startTime = utils.getTimeString(startDateTime.date, startDateTime.time);
    result.endTime = utils.getTimeString(endDateTime.date, endDateTime.time);
    result.startTimeStamp = new Date(result.startTime).getTime();
    result.endTimeStamp = new Date(result.endTime).getTime();
    return result;
    
}

export default {
    open,
    getLimitKeyByTimetamp,
    getTimestampByLimitKey,
    getTimeStringByTimestamp: utils.getTimeStringByTimestamp,
}