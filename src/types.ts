
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
    /**
     * Language using in component. Default use browser language
     * if language not support, use 'en-US' instead
     * 
     * @default navigator.language || `en-US`
     */
    lang?: Lang;
    // default time zone
    /**
     * Time zone in hour. For example: UTC+05:45 => `5.75`, UTC-02:00 => `-2`.
     *
     * Default for locale time zone. */
    timeZone?: number;
    granularity?: Granularity;
    enableZone?: boolean;

    // time period
    period?: boolean;

    // 下面的都是 period 为 true 生效

    endTime?: timeString;
    /** 最大选择时间，默认最近20年 */
    maxTime?: timeString;
    /** 最小选择时间，默认最近5年 */
    minTime?: timeString;
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
export type YyyyMm = `${number}-${number}`;
export type YyyyMmDd = `${YyyyMm}-${number}`;
export type HhMmSs = `${number}:${number}:${number}`;
export type HhMmSsMs = `${HhMmSs}.${number}`;
export type UtcOffset =
    | 'Z'
    | `+${number}:${number}`
    | `-${number}:${number}`;
export type timeString = `${YyyyMmDd}T${HhMmSsMs}${UtcOffset | ''}`;

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
