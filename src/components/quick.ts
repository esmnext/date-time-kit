import * as utils from "../utils";
import { kitContent, kitDataLimit, kitDataLimitContent, kitTimestampResult, timeString } from "../types";
import './quick.scss';
import i18n from "../i18n";

let QUICK_MAP = getQuickMap();

export function create(data: kitContent) {
    const ele = document.createElement('div');
    ele.classList.add('dt-quick');
    if (!data.enableZone) {
        ele.classList.add('dt-quick-zone-disabled');
    }

    ele.innerHTML = render(data);

    QUICK_MAP = getQuickMap();
    QUICK_MAP.all = getAllLimit(data);

    ele.querySelector('.dt-quick-item-active')?.classList.remove('dt-quick-item-active');
    const limitKey = getLimitKey(data);
    if (limitKey)
        ele.querySelector('.dt-quick-item[data-limit="' + limitKey + '"]')?.classList.add('dt-quick-item-active');
    // add event
    ele.addEventListener('click', (e) => {
        const target = e.target;
        if (!(target instanceof HTMLElement)) return;

        if (target.classList.contains('dt-quick-item')) {
            target.parentElement?.querySelector('.dt-quick-item-active')?.classList.remove('dt-quick-item-active');
            target.classList.add('dt-quick-item-active');

            const limit = target.getAttribute('data-limit') as kitDataLimit;
            setDate(limit, data);
            return;
        }

        if (target.matches('.dt-time-zone, .dt-time-zone-text, .dt-time-zone-icon')) {
            if (ele.classList.contains('dt-quick-zone-disabled'))
                return;
            ele.querySelector('.dt-time-zone')?.classList.add('dt-time-zone-select-show');
            return;
        }

        if (target.classList.contains('dt-time-zone-mask')) {
            ele.querySelector('.dt-time-zone')?.classList.remove('dt-time-zone-select-show');
            return;
        }

        const targetParent = target.parentElement;
        let zoneItem = target;
        if (targetParent?.classList.contains('dt-time-zone-item')) {
            zoneItem = targetParent;
        }
        if (zoneItem.classList.contains('dt-time-zone-item')) {
            ele.querySelector('.dt-time-zone-select-active')?.classList.remove('dt-time-zone-select-active');
            zoneItem.classList.add('dt-time-zone-select-active');
            data.timeZone = Number(zoneItem.getAttribute('data-timezone'));

            ele.querySelector('.dt-time-zone')?.classList.remove('dt-time-zone-select-show');
            return;
        }
    })
    return ele;
}

function setDate(limit: kitDataLimit, data: kitContent) {
    if (!QUICK_MAP[limit]) return;
    data.startDate = QUICK_MAP[limit].startDate;
    data.startTime = QUICK_MAP[limit].startTime;
    data.endDate = QUICK_MAP[limit].endDate;
    data.endTime = QUICK_MAP[limit].endTime;
    data.startDateShow = data.startDate;
    // if end time month equal start time month to show month
    const endData = utils.kitDate2Date(data.endDate);
    const startData = utils.kitDate2Date(data.startDate);
    if (endData.getFullYear() === startData.getFullYear() && endData.getMonth() == startData.getMonth()) {
        endData.setMonth(endData.getMonth() + 1);
    }
    data.moveDate = utils.initKitDate();
    data.endDateShow = {
        ...data.endDate,
        year: endData.getFullYear(),
        month: endData.getMonth() + 1
    };
}

function render(data: kitContent) {
    let html = '';
    for (const key in QUICK_MAP) {
        const limitKey = key as kitDataLimit;
        const limitData = QUICK_MAP[limitKey];
        if (data.maxLength && (!limitData || limitData.length >= data.maxLength))
            continue;
        html += `<div class="dt-quick-item" data-limit="${key}">${i18n[data.lang].quick[limitKey]}</div>`;
    }
    return !html ? '' : `${html
        }<div class="dt-time-zone"
  ><div class="dt-time-zone-text">${renderTimeZoneText(data)}</div
  ><div class="dt-time-zone-icon"></div
  ><div class="dt-time-zone-select">${renderTimeZoneList(data)}</div
></div
><div class="dt-time-zone-mask"></div>`;
}

const utcText = (timeZone: number) => {
    return timeZone >= 0
            ? `UTC+${('' + ~~timeZone).padStart(2, '0')}:${(timeZone * 60 % 60 + '').padStart(2, '0')}` as const
            : `UTC-${('' + ~~-timeZone).padStart(2, '0')}:${(-timeZone * 60 % 60 + '').padStart(2, '0')}` as const;
};

function renderTimeZoneText(data: kitContent) {
    return `${i18n[data.lang].quick.timezone}: ${utcText(data.timeZone)}` as const;
}

function renderTimeZoneList(data: kitContent) {
    const currentZone = utils.getCurrentTimeZone();
    let html = `<div class="dt-time-zone-select-title">${i18n[data.lang].quick.recommend}</div>`;

    const renderItem = (zone: number, active: boolean) => {
        return `<div class="dt-time-zone-item${active ? ' dt-time-zone-select-active' : ''}" data-timezone="${zone}">
            <span class="dt-time-zone-item-icon"></span>
            <span>${utcText(zone)}</span>
        </div>`;
    };

    const recommendZones = new Set([currentZone, 2]);

    // render recommend
    for (const zone of recommendZones) {
        html += renderItem(zone, data.timeZone === zone);
    }

    html += `<div class="dt-time-zone-select-title">${i18n[data.lang].quick.timezoneList}</div>`;

    // render all time zone
    const allZones = [-12, -11, -10, -9.5, -9, -8, -7, -6, -5, -4, -3, -3.5, -2, -1, 0, 1, 2, 3, 3.5, 4, 4.5, 5, 5.5, 5.75, 6, 6.5, 7, 8, 8.75, 9, 9.5, 10, 10.5, 11, 12, 12.45, 13, 14];
    for (const zone of allZones) {
        if (recommendZones.has(zone)) continue;
        html += renderItem(zone, data.timeZone === zone);
    }
    return html;
}
export function updateData(ele: HTMLElement, data: kitContent) {
    if (!data.period) return;
    const textElement = ele.querySelector('.dt-time-zone-text');
    if (!textElement) return;
    textElement.innerHTML = renderTimeZoneText(data);

    ele.querySelector('.dt-quick-item-active')?.classList.remove('dt-quick-item-active');
    const limitKey = getLimitKey(data);
    if (limitKey)
        ele.querySelector('.dt-quick-item[data-limit="' + limitKey + '"]')!.classList.add('dt-quick-item-active');
}

const quickEqData = (
    key: kitDataLimit,
    data: Pick<kitContent, 'endTime' | 'startTime' | 'startDate' | 'endDate'>
) => {
    const quick = QUICK_MAP[key];
    if (!quick) return false;
    return (
        quick.endTime.hour === data.endTime.hour &&
        quick.endTime.minute === data.endTime.minute &&
        quick.endTime.second === data.endTime.second &&
        quick.endTime.millisecond === data.endTime.millisecond &&

        quick.startTime.hour === data.startTime.hour &&
        quick.startTime.minute === data.startTime.minute &&
        quick.startTime.second === data.startTime.second &&
        quick.startTime.millisecond === data.startTime.millisecond &&

        quick.startDate.year === data.startDate.year &&
        quick.startDate.month === data.startDate.month &&
        quick.startDate.date === data.startDate.date &&

        quick.endDate.year === data.endDate.year &&
        quick.endDate.month === data.endDate.month &&
        quick.endDate.date === data.endDate.date
    );
};

export function getLimitKey(data: kitContent): kitDataLimit | null {
    for (const _key in QUICK_MAP) {
        const key = _key as kitDataLimit;
        if (!QUICK_MAP[key]) return null;
        if (quickEqData(key, data)) {
            return key;
        }
    }
    return null;
}
export function getQuickMap(): Record<kitDataLimit, kitDataLimitContent | null> {
    return {
        all: null,
        today: getTodayLimit(),
        yesterday: getYesterdayLimit(),
        week: getWeekLimit(),
        lastWeek: getLastWeekLimit(),
        last7Days: getLast7DaysLimit(),
        month: getMonthLimit(),
        last30Days: getLast30DaysLimit(),
        last180Days: getLast180DaysLimit(),
        last6Month: getLast6MonthLimit(),
        year: getYearLimit()
    };
}

function limitFactory(startTime = new Date(), endTime = startTime) {
    const result = {
        startDate: utils.initKitDate(startTime),
        startTime: utils.initKitTime(),
        endDate: utils.initKitDate(endTime),
        endTime: {
            hour: 23,
            minute: 59,
            second: 59,
            millisecond: 999
        },
        length: 0
    };
    result.length = new Date(utils.kitDateAndTime2timeStr(result.endDate, result.endTime)).getTime() -
        new Date(utils.kitDateAndTime2timeStr(result.startDate, result.startTime)).getTime();
    return result;
}

function getAllLimit(data: kitContent): kitDataLimitContent {
    return {
        startDate: data.minDate,
        startTime: data.minTime,
        endDate: data.maxDate,
        endTime: data.maxTime,
        length: data.maxTime.millisecond - data.minTime.millisecond
    };
}

function getTodayLimit(): kitDataLimitContent {
    return limitFactory();
}

function getYesterdayLimit(): kitDataLimitContent {
    const current = new Date();
    const startTime = new Date(current.getFullYear(), current.getMonth(), current.getDate() - 1);
    return limitFactory(startTime);
}

// week: 'This Week',
function getWeekLimit() {
    const current = new Date();
    const startTime = new Date(current.getFullYear(), current.getMonth(), current.getDate() - current.getDay() + 1);
    const endTime = new Date(current.getFullYear(), current.getMonth(), current.getDate() - current.getDay() + 7);
    return limitFactory(startTime, endTime);
}
// lastWeek: 'Last Week',
function getLastWeekLimit() {
    const current = new Date();
    const startTime = new Date(current.getFullYear(), current.getMonth(), current.getDate() - current.getDay() - 6);
    const endTime = new Date(current.getFullYear(), current.getMonth(), current.getDate() - current.getDay());
    return limitFactory(startTime, endTime);
}
// last7Days: 'Last 7 Days',
function getLast7DaysLimit() {
    const current = new Date();
    const startTime = new Date(current.getFullYear(), current.getMonth(), current.getDate() - 6);
    const endTime = new Date(current.getFullYear(), current.getMonth(), current.getDate());
    return limitFactory(startTime, endTime);
}
// month: 'This Month',
function getMonthLimit() {
    const current = new Date();
    const startTime = new Date(current.getFullYear(), current.getMonth(), 1);
    const endTime = new Date(current.getFullYear(), current.getMonth() + 1, 0);
    return limitFactory(startTime, endTime);
}
// last30Days: 'Last 30 Days',
function getLast30DaysLimit() {
    const current = new Date();
    const startTime = new Date(current.getFullYear(), current.getMonth(), current.getDate() - 29);
    const endTime = new Date(current.getFullYear(), current.getMonth(), current.getDate());
    return limitFactory(startTime, endTime);
}
// last180Days: 'Last 180 Days',
function getLast180DaysLimit() {
    const current = new Date();
    const startTime = new Date(current.getFullYear(), current.getMonth(), current.getDate() - 179);
    const endTime = new Date(current.getFullYear(), current.getMonth(), current.getDate());
    return limitFactory(startTime, endTime);
}
// last6Month: 'Last 6 Month',
function getLast6MonthLimit() {
    const current = new Date();
    const startTime = new Date(current.getFullYear(), current.getMonth() - 5, 1);
    const endTime = new Date(current.getFullYear(), current.getMonth() + 1, 0);
    return limitFactory(startTime, endTime);
}
// year: 'This Year'
function getYearLimit() {
    const current = new Date();
    const startTime = new Date(current.getFullYear(), 0, 1);
    const endTime = new Date(current.getFullYear() + 1, 0, 0);
    return limitFactory(startTime, endTime);
}

export function getLimitKeyByTimestamp(
    startTimestamp: timeString,
    endTimestamp: timeString,
    timeZone?: number
): kitDataLimit | null {
    const currentTimeZone = utils.getCurrentTimeZone();
    if (timeZone === void 0) {
        timeZone = currentTimeZone;
    }

    const startTimeDate = new Date(utils.getTimeStringByTimeZone(startTimestamp, currentTimeZone, timeZone));
    const endTimeDate = new Date(utils.getTimeStringByTimeZone(endTimestamp, currentTimeZone, timeZone));

    const endTime = utils.initKitTime(endTimeDate);
    const startTime = utils.initKitTime(startTimeDate);
    const startDate = utils.initKitDate(startTimeDate);
    const endDate = utils.initKitDate(endTimeDate);

    const QUICK_MAP = getQuickMap();
    for (const _key in QUICK_MAP) {
        const key = _key as kitDataLimit;
        if (!QUICK_MAP[key]) continue;
        if (quickEqData(key, { endTime, startTime, startDate, endDate })) {
            return key;
        }
    }
    return null;
}

export function getTimestampByLimitKey(
    limitKey: kitDataLimit,
    timeZone = utils.getCurrentTimeZone()
): kitTimestampResult {
    const result: kitTimestampResult = {
        startTime: '0000-00-00T00:00:00.000',
        endTime: '0000-00-00T00:00:00.000',
        startTimeStamp: 0,
        endTimeStamp: 0
    }
    const QUICK_MAP = getQuickMap();
    if (!QUICK_MAP[limitKey]) return result;

    const startDateTime = utils.getKitTimeByTimeZone({
        date: QUICK_MAP[limitKey].startDate,
        time: QUICK_MAP[limitKey].startTime
    }, timeZone);

    const endDateTime = utils.getKitTimeByTimeZone({
        date: QUICK_MAP[limitKey].endDate,
        time: QUICK_MAP[limitKey].endTime
    }, timeZone);

    result.startTime = utils.kitDateAndTime2timeStr(startDateTime.date, startDateTime.time);
    result.endTime = utils.kitDateAndTime2timeStr(endDateTime.date, endDateTime.time);
    result.startTimeStamp = new Date(result.startTime).getTime();
    result.endTimeStamp = new Date(result.endTime).getTime();
    return result;
}
