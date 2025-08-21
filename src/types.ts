
import { Lang } from './i18n';

export enum Granularity {
    day,
    second,
    millisecond
}

export interface kitTimestampResult {
    startTime: timeString;
    endTime: timeString;
    startTimeStamp: number;
    endTimeStamp: number;
}
export interface kitOption {
    root: HTMLElement;
    // default select
    startTime?: timeString;
    endTime?: timeString; // period 为true 生效
    // default limit
    maxTime?: timeString; // period 为true 生效
    minTime?: timeString; // period 为true 生效
    // default lang
    lang?: Lang;
    // default time zone
    timeZone?: number;
    granularity?: Granularity;
    enableZone?: boolean | undefined;
    // time period
    period?: boolean;

    maxLength?: number; // 选择的最大时长 单位ms period 为true 生效
    minLength?: number; // 选择的最小时长 单位ms period 为true 生效
}

export interface kitContent {
    startDate: kitDate;
    endDate: kitDate;
    startTime: kitTime;
    endTime: kitTime;
    startDateShow: kitDate;
    endDateShow: kitDate;
    moveDate: kitDate;
    maxDate: kitDate;
    minDate: kitDate;
    maxTime: kitTime;
    minTime: kitTime;
    lang: Lang;
    timeZone: number;
    enableZone: boolean;
    granularity: Granularity;
    period: boolean;
    maxLength: number; // 选择的最大时长 单位ms period 为true 生效
    minLength: number; // 选择的最小时长 单位ms period 为true 生效
}

export interface kitDate {
    year: number;
    month: number;
    date: number;
}

export interface kitTime {
    hour: number;
    minute: number;
    second: number;
    millisecond: number;
}


export interface kitDataLimitContent {
    startDate: kitDate;
    startTime: kitTime;
    endDate: kitDate;
    endTime: kitTime;
    length: number;
}


export interface kitComponentOption {
    ele: HTMLElement;
    component: kitComponent;
}

export interface kitComponent {
    updateData(ele: HTMLElement, data: kitContent): void;
    create(data: kitContent): HTMLElement;
}

export type status = 'start' | 'end';
export type timeString = `${number}-${number}-${number}T${number}:${number}:${number}.${number}`;


export interface kitResult {
    timeZone: number;
}
export interface kitResultPeriod extends kitResult {
    startTime: timeString;
    endTime: timeString;
    // time stamp
    startTimeStamp: number;
    endTimeStamp: number;
    quick: kitDataLimit | null;
}
export interface kitResultSingle extends kitResult {
    time: timeString;
    timeStamp: number;
}

export interface kitDateTime {
    date: kitDate,
    time: kitTime
}
export type kitDataLimit =
    | 'all'
    | 'today'
    | 'yesterday'
    | 'week'
    | 'lastWeek'
    | 'last7Days'
    | 'month'
    | 'last30Days'
    | 'last180Days'
    | 'last6Month'
    | 'year';
