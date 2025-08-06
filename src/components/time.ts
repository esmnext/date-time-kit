import { Granularity } from "@/enum";
import {  kitContent, kitDate, kitTime, status } from "../../type";
import './time.scss';
import i18n from "@/i18n";
import * as utils from '../utils';

export function create(data: kitContent) {

    const ele = document.createElement('div');
    ele.classList.add('dt-time');
    ele.innerHTML = render(data);

    if ( data.granularity <= Granularity.day) {
        // only show time
        return ele;
    }
 
    // add event
    ele.addEventListener('click', (e) => {
        const target = e.target as HTMLElement;
        if ( target.classList.contains('dt-time-select-item') ) {
            if ( target.classList.contains('dt-time-select-item-disabled') ) {
                return;
            }
            const status = target.getAttribute('data-status') as status;
            const hour = target.getAttribute('data-hour') as string;
            const minute = target.getAttribute('data-minute') as string;
            const second = target.getAttribute('data-second') as string;

            const time: keyof kitContent = status === 'start' ? 'startTime' : 'endTime';
            data[time] = {
                ...data[time],
                hour: hour ? Number(hour) : data[time].hour,
                minute: minute ? Number(minute) : data[time].minute,
                second: second ? Number(second) : data[time].second
            };

            target.parentElement?.querySelector('.dt-time-select-item-active')?.classList.remove('dt-time-select-item-active');
            target.classList.add('dt-time-select-item-active');
            // target.scrollIntoView({
            //     block: 'start',
            //     inline: 'center',
            //     behavior: 'smooth'
            // });
            target.parentElement!.scrollTo({
                top: target.offsetTop - 35,
                behavior: 'smooth'
            })
            return ;
        }

        if ( target.classList.contains('dt-time-mask') ) {
            ele.classList.remove('dt-time-select-box-show');
            // target.classList.remove('dt-time-mask-show');
            return ;
        }

        if( ele.classList.contains('dt-time-select-box-show') ) {
            return;
        }
        ele.innerHTML = render(data);
        ele.classList.add('dt-time-select-box-show');
        // ele.querySelector('.dt-time-mask')?.classList.add('dt-time-mask-show');
        setTimeout(() => {
            ele.querySelectorAll('.dt-time-select-item-active').forEach( (e) => {
                // e.scrollIntoView({
                //     block: 'start',
                //     inline: 'center',
                //     behavior: 'smooth'
                // });
                e.parentElement!.scrollTo({
                    top: (e as HTMLElement).offsetTop - 35,
                    behavior: 'smooth'
                })
            });
        }, 200);
    })
    
    ele.addEventListener('input', (e) => {
        const target = e.target as HTMLInputElement;
        if ( target.classList.contains('dt-time-millisecond-input') ) {
            const status = target.getAttribute('data-status') as status;
            const timeKey: keyof kitContent = status === 'start' ? 'startTime' : 'endTime';

            const value = target.value;
            if ( isNaN(Number(value)) ) {
                target.value = data[timeKey].millisecond.toString().padStart(3, '0');
                return;
            }

            data[timeKey] = {
                ...data[timeKey],
                millisecond: Number(value)
            };
            return ;
        }
    })
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
                ${ data.period ? '<div class="dt-time-line"></div>' : ''}
                ${ data.period ? renderSelectList(data, 'end') : ''}
            </div>
        </div>
        <div class="dt-time-mask"></div>
    `;
}


function renderSelectList(data: kitContent, status: status) {
    const isStart = status === 'start';
    const time = isStart ? data.startTime : data.endTime;


    // maxLength logic
    const disabledItem =  getDisabledItem(data);
   
    let hourList = '';
    for ( let i = 0, j = 23; i < 24; i++, j-- ) {
        const hourClassList = ['dt-time-select-item'];
        if ( time.hour === i ) {
            hourClassList.push('dt-time-select-item-active');
        }
        if (data.maxLength && !isStart  ) {
            if ( j < disabledItem.hour) {
                hourClassList.push('dt-time-select-item-disabled');
            }
        }
        
        hourList += `<div data-status="${status}" class="${hourClassList.join(' ')}" data-hour="${i}">${String(i).padStart(2, '0')}</div>`
    }
    let minuteList = '';
    let secondList = '';
    for ( let i = 0; i < 60; i++ ) {
        const minuteClassList = ['dt-time-select-item'];
        const secondClassList = ['dt-time-select-item'];
        if ( time.minute === i ) {
            minuteClassList.push('dt-time-select-item-active');
        }
        if ( time.second === i ) {
            secondClassList.push('dt-time-select-item-active');
        }
        if ( !isStart  ) {

            if ( i <= disabledItem.minute ) { 
                minuteClassList.push('dt-time-select-item-disabled');
            }
        }
        if ( !isStart ) {
            if ( i <= disabledItem.second) {
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
            <div class="dt-time-select-title">${status === 'start'? startTimeI18n: i18nTime.endTime}</div>
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
                <div>${status === 'start'? i18nTime.startMillisecond: i18nTime.endMillisecond}</div>
                <input type="text" 
                data-status="${status}"
                value="${time.millisecond.toString().padStart(3, '0')}" 
                class="dt-time-millisecond-input"
                maxlength="3"
                
                />
            </div>`;
}

function renderTimeString(data: kitContent) {
    if ( !data.period ) {
        if ( data.granularity <= Granularity.day ) {
            return utils.getDateTimeStr(data.startDate.year, data.startDate.month, data.startDate.date);
        }
        if ( data.granularity <= Granularity.second ) {
            return `${utils.getDateTimeStr(data.startDate.year, data.startDate.month, data.startDate.date)} ${utils.getTimeStringInSeconds(data.startTime.hour, data.startTime.minute, data.startTime.second)}`;
        }
        return utils.getTimeString(data.startDate, data.startTime);
    }
    if ( data.granularity <= Granularity.day ) {
        return `${utils.getDateTimeStr(data.startDate.year, data.startDate.month, data.startDate.date)}
        <span>-</span> 
        ${utils.getDateTimeStr(data.endDate.year, data.endDate.month, data.endDate.date)}`;
    }
    if ( data.granularity <= Granularity.second ) {
        return `${utils.getDateTimeStr(data.startDate.year, data.startDate.month, data.startDate.date)} ${utils.getTimeStringInSeconds(data.startTime.hour, data.startTime.minute, data.startTime.second)}
        <span>-</span> 
        ${utils.getDateTimeStr(data.endDate.year, data.endDate.month, data.endDate.date)}  ${utils.getTimeStringInSeconds(data.endTime.hour, data.endTime.minute, data.endTime.second)}`;
    }
    return `${utils.getTimeString(data.startDate, data.startTime)} <span>-</span> ${utils.getTimeString(data.endDate, data.endTime)}`;
}
/**
 * Updates the element with the given kitContent data.
 * @param ele The element to be updated.
 * @param data The kitContent data to be rendered.
 */
export function updateData(ele: HTMLElement, data: kitContent) {
    // ele.innerHTML = render(data);
    const disabledItem = getDisabledItem(data);
    console.log(disabledItem)
    const hourEndEle = ele.querySelectorAll('.dt-time-select-item[data-hour][data-status="end"]');
    const minuteEndEle = ele.querySelectorAll('.dt-time-select-item[data-minute][data-status="end"]');
    const secondEndEle = ele.querySelectorAll('.dt-time-select-item[data-second][data-status="end"]');
    
    

    for ( let i = 0, j = 59; i < 60; i++, j-- ) {
        const ele3 = hourEndEle[i];
        if ( ele3 && j < disabledItem.hour ) {
            ele3.classList.add('dt-time-select-item-disabled');
        } else {
            ele3.classList.remove('dt-time-select-item-disabled');
        }

        const ele = minuteEndEle[i];
        if ( j < disabledItem.minute ) {
            ele.classList.add('dt-time-select-item-disabled');
        } else {
            ele.classList.remove('dt-time-select-item-disabled');
        }

        const ele2 = secondEndEle[i];
        if ( j < disabledItem.second ) {
            
            ele2.classList.add('dt-time-select-item-disabled');
        } else {
            ele2.classList.remove('dt-time-select-item-disabled');
        }
    }
    ele.querySelector('.dt-time-string')!.innerHTML = renderTimeString(data);
}

function getDisabledItem( data: kitContent) {

    if ( !data.maxLength ) {
        return { hour: 23, minute: 59, second: 59 }
    }

    const startTimeStamp = new Date(utils.getTimeString(data.startDate, data.startTime));
    const endTimeStamp = new Date(utils.getTimeString(data.endDate, data.endTime));
    const gap = endTimeStamp.getTime() - startTimeStamp.getTime();
    const result = { hour: 0,  minute: 0, second: 0 };
    const gapLength = data.maxLength - gap;

    for ( let i = 0; i < 60; i++ ) {
        if ( i < 24 && gapLength - (i - data.endTime.hour)  * 60 * 60 * 1000  < 0 ) {
            result.hour++;
        }

        if ( gapLength - (i - data.endTime.minute)  * 60 * 1000  < 0 ) {
            result.minute++;
        }

        if ( gapLength - (i - data.endTime.second)  * 1000  < 0 ) {
            result.second++;
        }
    }
    
    return result;

}