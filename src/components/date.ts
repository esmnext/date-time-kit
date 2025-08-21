import { kitContent, status } from "../types";
import './date.scss';
import i18n from "../i18n";
import * as utils from '../utils';

/**
 * create a date box
 * @param data the data of date box
 * @param status the status of date box, default is `start`
 * @returns the element of date box
 */
export function create(data: kitContent, status: status = "start") {

    const ele = document.createElement('div');
    ele.classList.add('dt-time-date');
    ele.setAttribute('data-status', status);
    ele.innerHTML = render(data, status);


    // add event
    ele.addEventListener('click', (e) => {
        const target = e.target as HTMLElement;
        // click item
        const element = target.closest('.dt-data-item');
        if (element) {

            // disabled
            if (element.classList.contains('dt-data-item-disabled') ||
                element.classList.contains('dt-data-item-dis-sel')) {
                return;
            }

            const itemDate = new Date(target.getAttribute('data-date') as string);
            const date = {
                year: itemDate.getFullYear(),
                month: itemDate.getMonth() + 1,
                date: itemDate.getDate()
            };

            if (!data.period) {
                data.startDate = date;
                return;
            }
            // time period logic
            // end select
            if (data.startDate.year && !data.endDate.year) {
                // if start date is bigger than end date, then swap them
                if (new Date(data.startDate.year, data.startDate.month - 1, data.startDate.date).getTime() > itemDate.getTime()) {
                    data.endDate = data.startDate;
                    data.startDate = date;
                    return;
                }
                return data.endDate = date;
            }
            // clean move data
            if (data.moveDate.year) {
                data.moveDate = { year: 0, month: 0, date: 0 };
                return;
            }

            // start select
            data.moveDate = date;
            data.startDate = date;
            data.endDate = date;
            // data.endDate = {year: 0, month: 0, date: 0};

            return;

        }

    });
    ele.addEventListener('mousemove', (e) => {
        if (!data.period) {
            return;
        }

        const target = e.target as HTMLElement;
        const element = target.closest('.dt-data-item');
        if (element) {
            if (element.classList.contains('dt-data-item-disabled')) {
                return;
            }
            const moveDate = data.moveDate;
            if (!moveDate.year) {
                return;
            }

            const itemDate = new Date(target.getAttribute('data-date') as string);
            const date = {
                year: itemDate.getFullYear(),
                month: itemDate.getMonth() + 1,
                date: itemDate.getDate()
            };


            if (new Date(moveDate.year, moveDate.month - 1, moveDate.date).getTime() > itemDate.getTime()) {
                data.endDate = moveDate;
                data.startDate = date;
                return;
            }
            data.startDate = moveDate;
            data.endDate = date;


            return;

        }
    });
    return ele;
}

function render(data: kitContent, status: status) {
    let renderDate: Date | null = null;
    if (status === 'start' && !data.startDateShow.year) {
        renderDate = new Date();
    }

    if (status === 'start' && data.startDateShow.year) {
        renderDate = new Date(data.startDateShow.year, data.startDateShow.month - 1, data.startDateShow.date);
    }

    if (status === 'end' && !data.endDateShow.year) {
        // const current = new Date();
        if (!data.startDateShow.year) {
            renderDate = new Date();
            renderDate.setMonth(renderDate.getMonth() + 1);
        }
        else {

            renderDate = new Date(data.startDateShow.year, data.startDateShow.month - 1, data.startDateShow.date);;
            renderDate.setMonth(renderDate.getMonth() + 1);
        }
    }

    if (status === 'end' && data.endDateShow.year) {
        renderDate = new Date(data.endDateShow.year, data.endDateShow.month - 1, data.endDateShow.date);
    }

    let dataHTML = '';
    if (!renderDate) {
        renderDate = new Date();
    }
    dataHTML = renderDayByMonth(data, renderDate);
    const i18nDay = i18n[data.lang].date;
    return `
        <div class="dt-date-week">
            <div>${i18nDay.sun}</div>
            <div>${i18nDay.mon}</div>
            <div>${i18nDay.tue}</div>
            <div>${i18nDay.wed}</div>
            <div>${i18nDay.thu}</div>
            <div>${i18nDay.fri}</div>
            <div>${i18nDay.sat}</div>
        </div>
        <div class="dt-date-content" data-date="${utils.getDateTimeStr(renderDate?.getFullYear(), renderDate?.getMonth() + 1)}">
        ${dataHTML}
        </div>
    `;
}

function renderDayByMonth(data: kitContent, date: Date = new Date()) {
    const month = date.getMonth() + 1; // current month
    const days = new Date(date.getFullYear(), month, 0).getDate(); // current month days number
    const daysPrev = new Date(date.getFullYear(), month - 1, 0).getDate(); // previous month days number
    const weeklyPrev = new Date(date.getFullYear(), month - 1, 1).getDay(); // previous month first day

    // current time
    const current = new Date();
    const currentString = utils.getDateTimeStr(current.getFullYear(), current.getMonth() + 1, current.getDate());

    let dataHTML = ``;
    // previous month
    for (let i = daysPrev - weeklyPrev; i < daysPrev; i++) {
        dataHTML += `
            <div class="dt-data-item dt-data-item-disabled">
                <div class="dt-data-rect dt-data-item-disabled">
                    <div class="dt-data-text dt-data-item-disabled">${i + 1}</div>
                </div>
            </div>
        `;
    }


    // const startDate = `${data.startDate.year}-${data.startDate.month}-${data.startDate.date}`;
    // const endDate = `${data.endDate.year}-${data.endDate.month}-${data.endDate.date}`;
    const timeTem = { hour: 0, minute: 0, second: 0, millisecond: 0 }
    const startDate = utils.getTimeString(data.startDate, timeTem);
    const endDate = utils.getTimeString(data.endDate, timeTem);

    const minDateObj = new Date(utils.getTimeString(data.minDate, timeTem));
    const maxDateObj = new Date(utils.getTimeString(data.maxDate, timeTem));

    for (let i = 1; i <= days; i++) {
        const classList = ['dt-data-item'];
        // const renderDate = `${date.getFullYear()}-${month}-${i}`;
        const renderDate = utils.getTimeString({
            year: date.getFullYear(),
            month: month,
            date: i
        }, timeTem);
        const renderDateObj = new Date(renderDate);

        if (currentString === renderDate) {

            classList.push('dt-data-item-current');
        }

        if (data.period && data.startDate.year && data.endDate.year) {
            if (new Date(startDate) < renderDateObj && new Date(endDate) > renderDateObj) {
                classList.push('dt-data-item-sel');
            }

            if (startDate === renderDate) {
                classList.push('dt-data-item-start');
            }

            if (endDate === renderDate) {
                classList.push('dt-data-item-end');
            }
        }
        if (startDate === renderDate) {
            classList.push('dt-data-item-active');
        }

        if (minDateObj.getTime() > renderDateObj.getTime() ||
            maxDateObj.getTime() < renderDateObj.getTime()
        ) {
            classList.push('dt-data-item-disabled');
        }

        if (data.period && data.startDate.year && data.moveDate.year) {
            const dayLength = 1000 * 60 * 60 * 24;
            const maxLength = data.maxLength < dayLength ? dayLength : data.maxLength;
            // subtract 1 day because the selected day is also counted
            const minLength = data.minLength < dayLength ? dayLength : data.minLength;
            // minLength -= dayLength;

            const startTimeStamp = new Date(utils.getTimeString(data.startDate, data.startTime));
            const endTimeStamp = new Date(utils.getTimeString(data.endDate, data.endTime));
            // if length is 0 not limit
            if (data.maxLength && startTimeStamp.getTime() + maxLength < renderDateObj.getTime()) {

                classList.push('dt-data-item-disabled');
            }
            if (data.maxLength && endTimeStamp.getTime() - maxLength > renderDateObj.getTime()) {

                classList.push('dt-data-item-disabled');
            }
            if (data.minLength &&
                startTimeStamp.getTime() + minLength > renderDateObj.getTime() &&
                endTimeStamp.getTime() - minLength < renderDateObj.getTime()
            ) {
                if (startDate !== renderDate) {
                    classList.push('dt-data-item-disabled');

                }
                if (startDate === renderDate && data.minLength > dayLength) {
                    classList.push('dt-data-item-dis-sel');
                }

            }
        }


        dataHTML += `
            <div class="${classList.join(' ')}" data-date="${renderDate}">
                <div class="dt-data-rect"  data-date="${renderDate}">
                    <div class="dt-data-circle"  data-date="${renderDate}"></div>
                    <div class="dt-data-text"  data-date="${renderDate}">${i}</div>
                </div>
            </div>
        `;
    }

    // next month
    for (let i = 1; i <= 42 - weeklyPrev - days; i++) {

        dataHTML += `
            <div class="dt-data-item dt-data-item-disabled">
                <div class="dt-data-rect dt-data-item-disabled">
                    <div class="dt-data-text dt-data-item-disabled">${i}</div>
                </div>
            </div>
        `;
    }
    return dataHTML;
}

export function updateData(ele: HTMLElement, data: kitContent) {
    ele.innerHTML = render(data, ele.getAttribute('data-status') as status);
}
