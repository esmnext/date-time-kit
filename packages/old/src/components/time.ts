import {
    Granularity,
    type kitContent,
    type kitDate,
    type kitTime,
    type status
} from '../types';
import './time.scss';
import i18n from '../i18n';
import * as utils from '../utils';

export function create(data: kitContent) {
    const ele = document.createElement('div');
    ele.classList.add('dt-time');
    ele.innerHTML = render(data);

    // only show time
    if (data.granularity <= Granularity.day) return ele;

    // add event
    ele.addEventListener('click', (e) => {
        const target = e.target;
        if (!(target instanceof HTMLElement)) return;
        if (target.classList.contains('dt-time-select-item')) {
            if (target.classList.contains('dt-time-select-item-disabled')) {
                return;
            }
            const status = target.dataset.status as status;
            const hour = target.dataset.hour!;
            const minute = target.dataset.minute!;
            const second = target.dataset.second!;

            const time: keyof kitContent =
                status === 'start' ? 'startTime' : 'endTime';
            data[time] = {
                ...data[time],
                hour: hour ? Number(hour) : data[time].hour,
                minute: minute ? Number(minute) : data[time].minute,
                second: second ? Number(second) : data[time].second
            };

            target.parentElement
                ?.querySelector('.dt-time-select-item-active')
                ?.classList.remove('dt-time-select-item-active');
            target.classList.add('dt-time-select-item-active');
            target.parentElement?.scrollTo({
                top: target.offsetTop - 35,
                behavior: 'smooth'
            });
            return;
        }

        if (target.classList.contains('dt-time-mask')) {
            ele.classList.remove('dt-time-select-box-show');
            return;
        }

        if (ele.classList.contains('dt-time-select-box-show')) {
            return;
        }
        ele.innerHTML = render(data);
        ele.classList.add('dt-time-select-box-show');
        setTimeout(() => {
            ele.querySelectorAll<HTMLElement>(
                '.dt-time-select-item-active'
            ).forEach((e) => {
                e.parentElement?.scrollTo({
                    top: e.offsetTop - 35,
                    behavior: 'smooth'
                });
            });
        }, 200);
    });

    ele.addEventListener('input', (e) => {
        const target = e.target;
        if (!(target instanceof HTMLInputElement)) return;
        if (!target.classList.contains('dt-time-millisecond-input')) return;
        const status = target.dataset.status as status;
        const timeKey: keyof kitContent =
            status === 'start' ? 'startTime' : 'endTime';

        const value = target.value;
        if (Number.isNaN(Number(value))) {
            target.value = data[timeKey].millisecond
                .toString()
                .padStart(3, '0');
            return;
        }

        data[timeKey] = {
            ...data[timeKey],
            millisecond: Number(value)
        };
    });
    return ele;
}

function render(data: kitContent) {
    return `
        <div class="dt-time-body">
            <div class="dt-time-body-content">
                <span class="dt-time-string">${renderTimeString(data)}</span>
                <span class="dt-time-icon"></span>
            </div>
            <div class="dt-time-select-box">
                ${renderSelectList(data, 'start')}
                ${data.period ? '<div class="dt-time-line"></div>' : ''}
                ${data.period ? renderSelectList(data, 'end') : ''}
            </div>
        </div>
        <div class="dt-time-mask"></div>
    `;
}

function renderSelectList(data: kitContent, status: status) {
    const isStart = status === 'start';
    const time = isStart ? data.startTime : data.endTime;

    // maxLength logic
    const disabledItem = getDisabledItem(data);

    let hourList = '';
    for (let i = 0, j = 23; i < 24; i++, j--) {
        const hourClassList = ['dt-time-select-item'];
        if (time.hour === i) {
            hourClassList.push('dt-time-select-item-active');
        }
        if (data.maxLength && !isStart) {
            if (j < disabledItem.hour) {
                hourClassList.push('dt-time-select-item-disabled');
            }
        }

        hourList += `<div data-status="${status}" class="${hourClassList.join(' ')}" data-hour="${i}">${String(i).padStart(2, '0')}</div>`;
    }
    let minuteList = '';
    let secondList = '';
    for (let i = 0; i < 60; i++) {
        const minuteClassList = ['dt-time-select-item'];
        const secondClassList = ['dt-time-select-item'];
        if (time.minute === i) {
            minuteClassList.push('dt-time-select-item-active');
        }
        if (time.second === i) {
            secondClassList.push('dt-time-select-item-active');
        }
        if (!isStart) {
            if (i <= disabledItem.minute) {
                minuteClassList.push('dt-time-select-item-disabled');
            }
            if (i <= disabledItem.second) {
                secondClassList.push('dt-time-select-item-disabled');
            }
        }

        minuteList += `<div data-status="${status}" class="${minuteClassList.join(' ')}" data-minute="${i}">${String(i).padStart(2, '0')}</div>`;
        secondList += `<div data-status="${status}" class="${secondClassList.join(' ')}" data-second="${i}">${String(i).padStart(2, '0')}</div>`;
    }

    const i18nTime = i18n[data.lang].time;
    let startTimeI18n = i18nTime.singleTitle;
    if (!data.period) {
        startTimeI18n = i18nTime.startTime;
    }

    return `
        <div class="dt-time-select-body">
            <div class="dt-time-select-title">${status === 'start' ? startTimeI18n : i18nTime.endTime}</div>
            <div class="dt-time-select-content">
                <div class="dt-time-select-ul">
                    ${hourList}
                </div>
                <div class="dt-time-select-ul">
                    ${minuteList}
                </div>
                <div class="dt-time-select-ul">
                    ${secondList}
                </div>
            </div>
            ${data.granularity >= Granularity.millisecond ? renderMillisecondInput(data, status) : ''}
        </div>
    `;
}

function renderMillisecondInput(data: kitContent, status: status) {
    const i18nTime = i18n[data.lang].time;
    const time = status === 'start' ? data.startTime : data.endTime;

    return `<div class="dt-time-select-millisecond">
                <div>${status === 'start' ? i18nTime.startMillisecond : i18nTime.endMillisecond}</div>
                <input type="text"
                    data-status="${status}"
                    value="${time.millisecond.toString().padStart(3, '0')}"
                    class="dt-time-millisecond-input"
                    maxlength="3"
                />
            </div>`;
}

function renderTimeString(data: kitContent) {
    const { startDate, startTime, endDate, endTime } = data;
    const date2str = (date: kitDate) => utils.kitDate2dateStr(date);
    const time2str = (time: kitTime) => utils.kitTime2timeStr(time, true);
    const dateAndTime2str = (date: kitDate, time: kitTime, withoutMs = true) =>
        withoutMs
            ? date2str(date) + ' ' + time2str(time)
            : utils.kitDateAndTime2timeStr(date, time).replace('T', ' ');
    if (!data.period) {
        if (data.granularity <= Granularity.day) {
            return date2str(startDate);
        }
        if (data.granularity <= Granularity.second) {
            return dateAndTime2str(startDate, startTime);
        }
        return dateAndTime2str(startDate, startTime, false);
    }
    if (data.granularity <= Granularity.day) {
        return `${date2str(startDate)} <span>-</span> ${date2str(endDate)}`;
    }
    const withoutMs = data.granularity > Granularity.second;
    return `${dateAndTime2str(startDate, startTime, withoutMs)} <span>-</span> ${dateAndTime2str(endDate, endTime, withoutMs)}`;
}

/**
 * Updates the element with the given kitContent data.
 * @param ele The element to be updated.
 * @param data The kitContent data to be rendered.
 */
export function updateData(ele: HTMLElement, data: kitContent) {
    const disabledItem = getDisabledItem(data);
    const hourEndEle = ele.querySelectorAll(
        '.dt-time-select-item[data-hour][data-status="end"]'
    );
    const minuteEndEle = ele.querySelectorAll(
        '.dt-time-select-item[data-minute][data-status="end"]'
    );
    const secondEndEle = ele.querySelectorAll(
        '.dt-time-select-item[data-second][data-status="end"]'
    );

    for (let i = 0, j = 59; i < 60; ++i, --j) {
        hourEndEle[i]?.classList.toggle(
            'dt-time-select-item-disabled',
            j < disabledItem.hour
        );
        minuteEndEle[i]?.classList.toggle(
            'dt-time-select-item-disabled',
            j < disabledItem.minute
        );
        secondEndEle[i]?.classList.toggle(
            'dt-time-select-item-disabled',
            j < disabledItem.second
        );
    }

    const echoEle = ele.querySelector('.dt-time-string');
    if (echoEle) echoEle.innerHTML = renderTimeString(data);
}

function getDisabledItem(data: kitContent): kitTime {
    if (!data.maxLength)
        return { hour: 23, minute: 59, second: 59, millisecond: 999 };

    const startTimeStamp = new Date(
        utils.kitDateAndTime2timeStr(data.startDate, data.startTime)
    );
    const endTimeStamp = new Date(
        utils.kitDateAndTime2timeStr(data.endDate, data.endTime)
    );
    const gap = endTimeStamp.getTime() - startTimeStamp.getTime();
    const result = utils.initKitTime();
    const gapLength = data.maxLength - gap;

    for (let i = 0; i < 60; ++i) {
        if (i < 24 && gapLength - (i - data.endTime.hour) * 60 * 60 * 1000 < 0)
            ++result.hour;

        if (gapLength - (i - data.endTime.minute) * 60 * 1000 < 0)
            ++result.minute;

        if (gapLength - (i - data.endTime.second) * 1000 < 0) ++result.second;
    }

    return result;
}
