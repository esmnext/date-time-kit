import { kitContent, kitDate, kitTime, status } from "../../type";
import './time.scss';
import i18n from "@/i18n";

export function create(data: kitContent) {

    const ele = document.createElement('div');
    ele.classList.add('dt-time');
    ele.innerHTML = render(data);

    // add event
    ele.addEventListener('click', (e) => {
        const target = e.target as HTMLElement;
        if ( target.classList.contains('dt-time-select-item') ) {
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
            target.scrollIntoView({
                block: 'start',
                inline: 'center',
                behavior: 'smooth'
            });
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
                e.scrollIntoView({
                    block: 'start',
                    inline: 'center',
                    behavior: 'smooth'
                });
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
                <div class="dt-time-line"></div>
                ${renderSelectList(data, 'end')}
            </div>
        </div>
        <div class="dt-time-mask"></div>
    `;
}


function renderSelectList(data: kitContent, status: status) {
    let time = status === 'start' ? data.startTime : data.endTime;

    let hourList = '';
    for ( let i = 0; i < 24; i++ ) {
        hourList += `<div data-status="${status}" class="dt-time-select-item ${time.hour === i? 'dt-time-select-item-active': ''}" data-hour="${i}">${String(i).padStart(2, '0')}</div>`
    }
    let minuteList = '';
    let secondList = '';
    for ( let i = 0; i < 60; i++ ) {
        minuteList += `<div data-status="${status}" class="dt-time-select-item ${time.minute === i? 'dt-time-select-item-active': ''}" data-minute="${i}">${String(i).padStart(2, '0')}</div>`;
        secondList += `<div data-status="${status}" class="dt-time-select-item ${time.second === i? 'dt-time-select-item-active': ''}" data-second="${i}">${String(i).padStart(2, '0')}</div>`;
    }

    const i18nTime = i18n[data.lang].time;
    return `
        <div class="dt-time-select-body">
            <div class="dt-time-select-title">${status === 'start'? i18nTime.startTime: i18nTime.endTime}</div>
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
            <div class="dt-time-select-millisecond">
                <div>${status === 'start'? i18nTime.startMillisecond: i18nTime.endMillisecond}</div>
                <input type="text" 
                data-status="${status}"
                value="${time.millisecond.toString().padStart(3, '0')}" 
                class="dt-time-millisecond-input"
                maxlength="3"
                
                />
            </div>
        </div>
        
    `;
}


function renderTimeString(data: kitContent) {
    return `${renderDate(data.startDate)} ${renderTime(data.startTime)} 
        <span>-</span>
    ${renderDate(data.endDate)} ${renderTime(data.endTime)}`

}
function renderDate(data: kitDate) {
    return `${String(data.year).padStart(4, '0')}-${String(data.month).padStart(2, '0')}-${String(data.date).padStart(2, '0')}`
}
function renderTime(time: kitTime) {
    return `${String(time.hour).padStart(2, '0')}:${String(time.minute).padStart(2, '0')}:${String(time.second).padStart(2, '0')}.${String(time.millisecond).padStart(3, '0')}`
}
/**
 * Updates the element with the given kitContent data.
 * @param ele The element to be updated.
 * @param data The kitContent data to be rendered.
 */
export function updateData(ele: HTMLElement, data: kitContent) {
    // ele.innerHTML = render(data);
    ele.querySelector('.dt-time-string')!.innerHTML = renderTimeString(data);
}