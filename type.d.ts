import { Granularity } from './granularity';

export declare function open(kitOpiton: kitOption): Promise<kitResult>;
export declare function getLimitKeyByTimetamp(startTimestamp: timeString, endTimestamp: timeString, timeZone?: number | undefined): kitDataLimit | null;
export declare function getTimestampByLimitKey(limit: kitDataLimit, timeZone?: number | undefined): kitTimestampResult;
export declare function getTimeStringByTimestamp(timestamp: number): timeString;
export declare function getTimeStringByTimeZone(timeString: timeString, timeZone: number, currentTimeZone?: number): timeString;
export default {
    open,
    getLimitKeyByTimetamp,
    getTimestampByLimitKey,
    getTimeStringByTimestamp,
    getTimeStringByTimeZone
}
export interface kitTimestampResult {
    startTime: timeString,
    endTime: timeString,
    startTimeStamp: number,
    endTimeStamp: number
}
export interface kitContent {
    startDate: kitDate,
    endDate: kitDate,
    startTime: kitTime,
    endTime: kitTime,
    startDateShow: kitDate,
    endDateShow: kitDate,
    moveDate: kitDate,
    maxDate: kitDate,
    minDate: kitDate,
    maxTime: kitTime,
    minTime: kitTime,
    lang: Lang,
    timeZone: number,
    enableZone: boolean,
    granularity: Granularity
}

export interface kitDate {
    year: number,
    month: number,
    date: number
}

export interface kitTime {
    hour: number,
    minute: number,
    second: number,
    millisecond: number
}


export interface kitDataLimitContent {
    startDate: kitDate,
    startTime: kitTime,
    endDate: kitDate,
    endTime: kitTime
}


export interface kitComponentOption {
    ele: HTMLElement,
    component: kitComponent
}

export interface kitComponent {
    updateData(ele: HTMLElement, data: kitContent): void
    create(data: kitContent): HTMLElement
}

export type status = 'start' | 'end';
export type timeString = `${number}-${number}-${number}T${number}:${number}:${number}.${number}`;
export type Lang = 'zhCN' | 'enUS';
export interface kitOption {
    root: HTMLElement,
    // default select
    startTime?: timeString,
    endTime?: timeString,
    // default limit
    maxTime?: timeString,
    minTime?: timeString,
    // default lang
    lang?: Lang,
    // default time zone
    timeZone?: number,
    granularity?: Granularity,
    enableZone?: boolean | undefined
}


export interface kitResult {
    startTime: timeString,
    endTime: timeString,
    // time stamp
    startTimeStamp: number,
    endTimeStamp: number,
    quick: kitDataLimit | null,
    timeZone: number
}
export type kitI18n = {
    [key in Lang]: { 
        box: {
            confirm: string,
            cancel: string
        },
        quick: {
            all: string,
            today: string,
            yesterday: string,
            week: string,
            lastWeek: string,
            last7Days: string,
            month: string,
            last30Days: string,
            last180Days: string,
            last6Month: string,
            year: string,
            timezone: string,
            recommend: string,
            timezoneList: string,
        },
        date: {
            sun: string,
            mon: string,
            tue: string,
            wed: string,
            thu: string,
            fri: string,
            sat: string,
        },
        time: {
            startTime: string,
            endTime: string,
            startMillisecond: string,
            endMillisecond: string,
        }
     }
}

export interface kitDateTime {
    date: kitDate,
    time: kitTime
}
export type kitDataLimit = 'all' | 'today' | 'yesterday' | 'week' | 'lastWeek' | 'last7Days' | 'month' | 'last30Days' | 'last180Days' | 'last6Month' | 'year';