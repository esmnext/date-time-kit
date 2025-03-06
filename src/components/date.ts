import { kitContent, kitDate, status } from "../../type";
import './date.scss';

    /**
     * create a date box
     * @param data - the data of date box
     * @param status - the status of date box, default is "start"
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
        if ( 
            target.classList.contains('dt-data-item') ||
            target.classList.contains('dt-data-rect') ||
            target.classList.contains('dt-data-circle') ||
            target.classList.contains('dt-data-text')
        ) {
            // disabled
            if ( target.classList.contains('dt-data-item-disabled') ) {
                return;
            }

            const itemDate = new Date(target.getAttribute('data-date') as string);
            const date = {
                year: itemDate.getFullYear(),
                month: itemDate.getMonth() + 1,
                date: itemDate.getDate()
            };
            // start
            if ( data.startDate.year && !data.endDate.year ) {
                if(new Date(`${data.startDate.year}-${data.startDate.month}-${data.startDate.date}`).getTime() > itemDate.getTime()) {
                        data.endDate = data.startDate;
                        data.startDate = date;
                        return ;
                }
                return data.endDate = date;
            }
            // end 
            if ( data.moveDate.year) {
                data.moveDate = {year: 0, month: 0, date: 0};
                return;
            }

            // start
            data.moveDate = date;
            data.startDate = date;
            data.endDate = {year: 0, month: 0, date: 0};
            return;
            
        }

    });
    ele.addEventListener('mousemove', (e) => {
        const target = e.target as HTMLElement;
        if ( 
            target.classList.contains('dt-data-item') ||
            target.classList.contains('dt-data-rect') ||
            target.classList.contains('dt-data-circle') ||
            target.classList.contains('dt-data-text')
        ) {
            if ( target.classList.contains('dt-data-item-disabled') ) {
                return;
            }
            const moveDate = data.moveDate;
            if ( !moveDate.year ) {
                return;
            }
            
            const itemDate = new Date(target.getAttribute('data-date') as string);
            const date = {
                year: itemDate.getFullYear(),
                month: itemDate.getMonth() + 1,
                date: itemDate.getDate()
            };


            if(new Date(`${moveDate.year}-${moveDate.month}-${moveDate.date}`).getTime() > itemDate.getTime()) {
                    data.endDate = moveDate;
                    data.startDate = date;
                    return ;
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
    if ( status === 'start' && !data.startDateShow.year ) {
        renderDate = new Date();
    }

    if ( status === 'start' && data.startDateShow.year ) {
        renderDate = new Date(`${data.startDateShow.year}-${data.startDateShow.month}-${data.startDateShow.date}`);
    }
   
    if ( status === 'end' && !data.endDateShow.year ) {
        // const current = new Date();
        if ( !data.startDateShow.year  ) {
            renderDate = new Date();
            renderDate.setMonth(renderDate.getMonth() + 1);
        }
        else {

            renderDate = new Date(`${data.startDateShow.year}-${data.startDateShow.month}-${data.startDateShow.date}`);
            renderDate.setMonth(renderDate.getMonth() + 1);
        }
    }

    if ( status === 'end' && data.endDateShow.year ) {
        renderDate = new Date(`${data.endDateShow.year}-${data.endDateShow.month}-${data.endDateShow.date}`);
    }

    let dataHTML = '';
    if ( !renderDate ) {
        renderDate = new Date();
    }
    dataHTML = renderDayByMonth(data, renderDate);
    return `
        <div class="dt-date-week">
            <div>Sun</div>
            <div>Mon</div>
            <div>Tue</div>
            <div>Wed</div>
            <div>Thu</div>
            <div>Fri</div>
            <div>Sat</div>
        </div>
        <div class="dt-date-content" data-date="${renderDate?.getFullYear()}-${renderDate?.getMonth() + 1}">
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
    const currnet = new Date();
    const currentString = `${currnet.getFullYear()}-${currnet.getMonth() + 1}-${currnet.getDate()}`;


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

   
    const startDate = `${data.startDate.year}-${data.startDate.month}-${data.startDate.date}`;
    const endDate = `${data.endDate.year}-${data.endDate.month}-${data.endDate.date}`;
    for (let i = 1; i <= days; i++) {
        const classList = ['dt-data-item'];
        const renderDate = `${date.getFullYear()}-${month}-${i}`;

        if ( currentString === renderDate ) {
            classList.push('dt-data-item-current');
        }
        
        if ( data.startDate.year && data.endDate.year ) {
            if ( new Date(startDate) < new Date(renderDate) && new Date(endDate) > new Date(renderDate) ) {
                classList.push('dt-data-item-sel');
            }

            if ( startDate === renderDate ) {
                classList.push('dt-data-item-start');
            }

            if ( endDate === renderDate ) {
                classList.push('dt-data-item-end');
            }
        } 
        if ( startDate === renderDate ) {
            classList.push('dt-data-item-active');
        }
        
        // if ( data.startDateShow.year && data.endDateShow.year ) {
        //     const startDateShow = `${data.startDateShow.year}-${data.startDateShow.month}-${data.startDateShow.date}`;
        //     const endDateShow = `${data.endDateShow.year}-${data.endDateShow.month}-${data.endDateShow.date}`; 
        //     if ( new Date(startDateShow) < new Date(renderDate) && new Date(endDateShow) > new Date(renderDate) ) {
        //         classList.push('dt-data-item-sel');
        //     }

        //     if ( startDateShow === renderDate ) {
        //         classList.push('dt-data-item-start');
        //     }

        //     if ( endDateShow === renderDate ) {
        //         classList.push('dt-data-item-end');
        //     }
        // }
        
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
    // const status = ele.getAttribute('data-status') as status;
    // const showKey = status === 'start' ? 'startDateShow' : 'endDateShow';
    // const currentDateStr = ele.querySelector('.dt-date-content')?.getAttribute('data-date');
    // const currentDate = new Date(currentDateStr as string);
    // if ( data[showKey].year === currentDate.getFullYear() && data[showKey].month === currentDate.getMonth() + 1  ) {
    //     return;
    // }


    ele.innerHTML = render(data, ele.getAttribute('data-status') as status);
}