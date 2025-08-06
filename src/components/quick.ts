import * as utils from "../utils";
import { kitContent, kitDataLimit,  kitDataLimitContent } from "../../type";
import './quick.scss';
import i18n from "@/i18n";

let QUICK_MAP = getQuickMap();
 
export function create(data: kitContent) {
    const ele = document.createElement('div');
    ele.classList.add('dt-quick');
    if ( !data.enableZone ) {
        ele.classList.add('dt-quick-zone-disabled');
    }

    ele.innerHTML = render(data);
    
    QUICK_MAP = getQuickMap();
    QUICK_MAP.all = getAllLimit(data);
    
    ele.querySelector('.dt-quick-item-active')?.classList.remove('dt-quick-item-active');
    const limitKey = getLimitKey(data);
    limitKey && ele.querySelector('.dt-quick-item[data-limit="' + limitKey + '"]')!.classList.add('dt-quick-item-active');
    // add event
    ele.addEventListener('click', (e) => {
        const target = e.target as HTMLElement;
        if ( target.classList.contains('dt-quick-item') ) {
            target.parentElement?.querySelector('.dt-quick-item-active')?.classList.remove('dt-quick-item-active');
            target.classList.add('dt-quick-item-active');

            const limit = target.getAttribute('data-limit') as kitDataLimit;
            setDate(limit, data);
            return;
        }

        if ( target.classList.contains('dt-time-zone') ||
            target.classList.contains('dt-time-zone-text') ||
            target.classList.contains('dt-time-zone-icon')
        ) {
            if ( ele.classList.contains('dt-quick-zone-disabled') ) {
                return;
            }
            ele.querySelector('.dt-time-zone')?.classList.add('dt-time-zone-select-show');
            return;
        }

        if ( target.classList.contains('dt-time-zone-mask') ) {
            ele.querySelector('.dt-time-zone')?.classList.remove('dt-time-zone-select-show');
            return;
        }

        let targetParent = target.parentElement;
        let zoneItem = target;
        if (targetParent?.classList.contains('dt-time-zone-item')) {
            zoneItem = targetParent;
        }
        if ( zoneItem.classList.contains('dt-time-zone-item')) {
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

    if ( !QUICK_MAP[limit] ) {
        return;
    } 
    data.startDate = QUICK_MAP[limit].startDate;
    data.startTime = QUICK_MAP[limit].startTime;
    data.endDate = QUICK_MAP[limit].endDate;
    data.endTime = QUICK_MAP[limit].endTime;
    data.startDateShow = data.startDate;
    // if end time month equal start time month to show month
    // const endData = new Date(`${data.endDate.year}-${data.endDate.month}-${data.endDate.date}`);
    const endData = new Date(data.endDate.year, data.endDate.month - 1, data.endDate.date);
    // const startData = new Date(`${data.startDate.year}-${data.startDate.month}-${data.startDate.date}`);
    const startData = new Date(data.startDate.year, data.startDate.month - 1, data.startDate.date);
    if ( endData.getFullYear() === startData.getFullYear() && endData.getMonth() == startData.getMonth() ) {
        endData.setMonth(endData.getMonth() + 1);
    }
    data.moveDate = {
        year: 0,
        month: 0,
        date: 0
    }
    data.endDateShow = {
        ...data.endDate,
        year: endData.getFullYear(),
        month: endData.getMonth() + 1
    };

}
function render(data: kitContent) {
    let html = '';
    

    for ( const key in QUICK_MAP) {
        const limitKey = key as keyof typeof QUICK_MAP;
        const limitData = QUICK_MAP[limitKey];
        console.log(key, limitData, data.maxLength);
        if ( data.maxLength && (!limitData || limitData.length >= data.maxLength) ) {
            continue;
        }

        html += `<div class="dt-quick-item" data-limit="${key}">${i18n[data.lang].quick[limitKey]}</div>`;
    }
    if ( !html ) {
        return '';
    }
    return `
        ${html}
        <div class="dt-time-zone">
            <div class="dt-time-zone-text">${renderTimeZoneText(data)}</div>
            <div class="dt-time-zone-icon"></div>
            <div class="dt-time-zone-select">
                ${renderTimeZoneList(data)}
            </div>
        </div>
        <div class="dt-time-zone-mask"></div>
    `;
}


function renderTimeZoneText( data: kitContent ) {
    if ( data.timeZone >= 0 ) {
        return `
           ${i18n[data.lang].quick.timezone}: UTC+${data.timeZone}
        `;
    }
    return `
       ${i18n[data.lang].quick.timezone}: UTC${data.timeZone}
    `;
}

function renderTimeZoneList(data: kitContent) {
    // get current time zone
    const currentZone = -new Date().getTimezoneOffset() / 60;
    let html = `<div class="dt-time-zone-select-title">${i18n[data.lang].quick.recommend}</div>`;

    // render recomment
    if (currentZone >= 0) {
        html += `<div class="dt-time-zone-item${data.timeZone === currentZone ? ' dt-time-zone-select-active' : ''}"" data-timezone="${currentZone}">
            <span class="dt-time-zone-item-icon"></span><span>UTC+${currentZone}</span>
        </div>`;
    } else {
        html += `<div class="dt-time-zone-item${data.timeZone === 2 ? ' dt-time-zone-select-active' : ''}"" data-timezone="${currentZone}">
            <span class="dt-time-zone-item-icon"></span><span>UTC${currentZone}</span>
        </div>`;
    }
    
    html += `<div class="dt-time-zone-item" data-timezone="2">
        <span class="dt-time-zone-item-icon"></span><span>UTC+2</span>
    </div>`;
    html += `<div class="dt-time-zone-select-title">${i18n[data.lang].quick.timezoneList}</div>`;

    // render all time zone
    for (let i = 0; i <= 12; i++) {

        if ( i === currentZone ) {
            continue;
        }
        if ( i === 2 ) {
            continue;
        }
        html += `<div class="dt-time-zone-item${i === data.timeZone ? ' dt-time-zone-select-active' : ''}" data-timezone="${i}">
            <span class="dt-time-zone-item-icon"></span>
            <span>UTC+${i}</span>
        </div>`;
    }
    for (let i = 12; i > 0; i--) {
        if ( i === currentZone ) {
            continue;
        }
        html += `<div class="dt-time-zone-item${i === data.timeZone ? ' dt-time-zone-select-active' : ''}" data-timezone="-${i}">
            <span class="dt-time-zone-item-icon"></span><span>UTC-${i}</span>
        </div>`;
    }
    return html;
}
export function updateData(ele: HTMLElement, data: kitContent) {
    // ele.innerHTML = render(data);
    if ( !data.period ) {
        return ;
    }
    const textElement = ele.querySelector('.dt-time-zone-text');
    
    if (!textElement ) {
        return;
    }
    textElement.innerHTML = renderTimeZoneText(data);

    ele.querySelector('.dt-quick-item-active')?.classList.remove('dt-quick-item-active');
    const limitKey = getLimitKey(data);
    limitKey && ele.querySelector('.dt-quick-item[data-limit="' + limitKey + '"]')!.classList.add('dt-quick-item-active');
}

export function getLimitKey(data: kitContent): kitDataLimit | null {
    for ( const key in QUICK_MAP) {
        if ( !QUICK_MAP[key as keyof typeof QUICK_MAP] ) {
            return null;
        }
        
        if ( 
            QUICK_MAP[key as keyof typeof QUICK_MAP]?.endTime.hour === data.endTime.hour &&
            QUICK_MAP[key as keyof typeof QUICK_MAP]?.endTime.minute === data.endTime.minute &&
            QUICK_MAP[key as keyof typeof QUICK_MAP]?.endTime.second === data.endTime.second &&
            QUICK_MAP[key as keyof typeof QUICK_MAP]?.endTime.millisecond === data.endTime.millisecond &&

            QUICK_MAP[key as keyof typeof QUICK_MAP]?.startTime.hour === data.startTime.hour &&
            QUICK_MAP[key as keyof typeof QUICK_MAP]?.startTime.minute === data.startTime.minute &&
            QUICK_MAP[key as keyof typeof QUICK_MAP]?.startTime.second === data.startTime.second &&
            QUICK_MAP[key as keyof typeof QUICK_MAP]?.startTime.millisecond === data.startTime.millisecond &&

            QUICK_MAP[key as keyof typeof QUICK_MAP]?.startDate.year === data.startDate.year &&
            QUICK_MAP[key as keyof typeof QUICK_MAP]?.startDate.month === data.startDate.month &&
            QUICK_MAP[key as keyof typeof QUICK_MAP]?.startDate.date === data.startDate.date &&

            QUICK_MAP[key as keyof typeof QUICK_MAP]?.endDate.year === data.endDate.year &&
            QUICK_MAP[key as keyof typeof QUICK_MAP]?.endDate.month === data.endDate.month &&
            QUICK_MAP[key as keyof typeof QUICK_MAP]?.endDate.date === data.endDate.date 

        ) {
            return key as kitDataLimit;
        }
    }
    return null;
}
export function getQuickMap(): { [key in kitDataLimit]: kitDataLimitContent | null} {
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
    }
}


function startTimeFactory() {
    return {
        hour: 0,
        minute: 0,
        second: 0,
        millisecond: 0
    }
}
function endTimeFactory() {
    return {
        hour: 23,
        minute: 59,
        second: 59,
        millisecond: 999
    }
}

function limitFactory(startTime: Date, endTime: Date) {
    const result =  {
        startDate: {
            year: startTime.getFullYear(),
            month: startTime.getMonth() + 1,
            date: startTime.getDate()
        },
        startTime: startTimeFactory(),
        endDate: {
            year: endTime.getFullYear(),
            month: endTime.getMonth() + 1,
            date: endTime.getDate()
        },
        endTime: endTimeFactory(),
        length:  0
    }

    result.length = new Date(utils.getTimeString(result.endDate, result.endTime)).getTime() - 
    new Date(utils.getTimeString(result.startDate, result.startTime)).getTime();
    return result;
}

function getAllLimit(data: kitContent): kitDataLimitContent {
    return {
        startDate: data.minDate,
        startTime: data.minTime,
        endDate: data.maxDate,
        endTime: data.maxTime,
        length: data.maxTime.millisecond - data.minTime.millisecond
    }
}

function getTodayLimit(): kitDataLimitContent {
    const current = new Date();
    return limitFactory(current, current);
}

function getYesterdayLimit(): kitDataLimitContent {
    const current = new Date();
    const startTime = new Date(current.getFullYear(), current.getMonth(), current.getDate() - 1);
    const endTime = new Date(current.getFullYear(), current.getMonth(), current.getDate() - 1);
    return limitFactory(startTime, endTime);
}

// week: 'This Week',
function getWeekLimit() {
    const current = new Date();
    const startTime = new Date(current.getFullYear(), current.getMonth(), current.getDate() - current.getDay() + 1 );
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