
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
    timeZone: number
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
export type timeString = `${number}-${number}-${number} ${number}:${number}:${number}:${number}`;
export type lang = 'zh-CN' | 'en-US';
export interface kitOption {
    root: HTMLElement,
    // default select
    startTime?: timeString,
    endTime?: timeString,
    // default limit
    maxTime?: timeString,
    minTime?: timeString,
    // default lang
    lang?: lang,
    // default time zone
    timeZone?: number
}

export interface kitResult {
    startTime: timeString,
    endTime: timeString,
    // time stamp
    startTimeStamp: number,
    endTimeStamp: number,
     
    timeZone: number
}

export type kitDataLimit = 'all' | 'today' | 'yesterday' | 'week' | 'lastWeek' | 'last7Days' | 'month' | 'last30Days' | 'last180Days' | 'last6Month' | 'year';