import { kitContent, status } from "../types";
import './date.scss';
import i18n, { kitI18nCfg } from "../i18n";
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
        if (!(e.target instanceof HTMLElement)) return;
        // click item
        const element = e.target.closest('.dt-data-item');
        if (!element || element.matches('.dt-data-item-disabled, .dt-data-item-dis-sel'))
            return;

        const itemDate = new Date(e.target.dataset.date!);
        const date = utils.initKitDate(itemDate);

        if (!data.period) {
            data.startDate = date;
            return;
        }
        // time period logic
        // end select
        if (data.startDate.year && !data.endDate.year) {
            // if start date is bigger than end date, then swap them
            if (utils.kitDate2Date(data.startDate) > itemDate) {
                data.endDate = data.startDate;
                data.startDate = date;
            } else data.endDate = date;
            return;
        }
        // clean move data
        if (data.moveDate.year) {
            return data.moveDate = utils.initKitDate();
        }
        // start select
        data.moveDate = data.startDate = data.endDate = date;
    });
    ele.addEventListener('mousemove', (e) => {
        const { period, moveDate } = data;
        if (!period || !moveDate.year || !(e.target instanceof HTMLElement))
            return;

        const element = e.target.closest('.dt-data-item');
        if (!element || element.matches('.dt-data-item-disabled'))
            return;

        const itemDate = new Date(e.target.dataset.date!);
        const date = utils.initKitDate(itemDate);

        if (utils.kitDate2Date(moveDate) > itemDate) {
            data.endDate = moveDate;
            data.startDate = date;
            return;
        }
        data.startDate = moveDate;
        data.endDate = date;
    });

    return ele;
}

const renderWeekTitle = (i18n: kitI18nCfg['date']) => `<div class="dt-date-week"
  ><div>${i18n.sun}</div
  ><div>${i18n.mon}</div
  ><div>${i18n.tue}</div
  ><div>${i18n.wed}</div
  ><div>${i18n.thu}</div
  ><div>${i18n.fri}</div
  ><div>${i18n.sat}</div
></div>`;

function render(data: kitContent, status: status) {
    let renderDate = new Date();

    if (status === 'start' && data.startDateShow.year) {
        renderDate = utils.kitDate2Date(data.startDateShow);
    }

    if (status === 'end' && !data.endDateShow.year) {
        if (data.startDateShow.year) {
            renderDate = utils.kitDate2Date(data.startDateShow);
        }
        renderDate.setMonth(renderDate.getMonth() + 1);
    }

    if (status === 'end' && data.endDateShow.year) {
        renderDate = utils.kitDate2Date(data.endDateShow);
    }

    const dataHTML = renderDayByMonth(data, renderDate);
    return `${renderWeekTitle(i18n[data.lang].date)
        }<div class="dt-date-content" data-date="${utils.getDateTimeStr(renderDate?.getFullYear(), renderDate?.getMonth() + 1)
        }">${dataHTML}</div>`;
}

function renderDayByMonth(data: kitContent, date: Date) {
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
<div class="dt-data-item dt-data-item-disabled"
  ><div class="dt-data-rect dt-data-item-disabled"
    ><div class="dt-data-text dt-data-item-disabled">${i + 1}</div
  ></div
></div>`;
    }

    const timeTem = utils.initKitTime();
    const startDate = utils.kitDate2timeString(data.startDate, timeTem);
    const endDate = utils.kitDate2timeString(data.endDate, timeTem);

    const minDateObj = new Date(utils.kitDate2timeString(data.minDate, timeTem));
    const maxDateObj = new Date(utils.kitDate2timeString(data.maxDate, timeTem));

    for (let i = 1; i <= days; i++) {
        const classList = ['dt-data-item'];
        // const renderDate = `${date.getFullYear()}-${month}-${i}`;
        const renderDate = utils.kitDate2timeString({
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

            const startTimeStamp = new Date(utils.kitDate2timeString(data.startDate, data.startTime));
            const endTimeStamp = new Date(utils.kitDate2timeString(data.endDate, data.endTime));
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
