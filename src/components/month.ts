import { kitContent, status } from "../../type";
import './month.scss';

/**
 * Create a month select box
 * @param data - the data of date picker
 * @param status - the status of date picker, default is "start"
 * @returns the element of month select box
 */
export function create(data: kitContent, status: status = "start") {

    const ele = document.createElement('div');
    ele.classList.add(...getBoxClass(data, status));
    ele.setAttribute('data-status', status);
    ele.innerHTML = render(data, status);

    // add event
    ele.addEventListener('click', (e) => {
        const target = e.target as HTMLElement;
        
        // sub year
        if ( target.classList.contains('dt-month-year-sub') ) {
            const dateShow: keyof kitContent = status === 'start' ? 'startDateShow' : 'endDateShow';
            data[dateShow] = {
                ...data[dateShow],
                year: data[dateShow].year - 1,
                
            }
            return;
        }

        // add year
        if ( target.classList.contains('dt-month-year-add') ) {
            const dateShow: keyof kitContent = status === 'start' ? 'startDateShow' : 'endDateShow';
            data[dateShow] = {
                ...data[dateShow],
                year: data[dateShow].year + 1,
                
            }
            return;
        }
        
        // sub month
        if ( target.classList.contains('dt-month-sub') ) {
            const dateShow: keyof kitContent = status === 'start' ? 'startDateShow' : 'endDateShow';
            const newDate = new Date(data[dateShow].year, data[dateShow].month - 1, data[dateShow].date);
            newDate.setMonth(newDate.getMonth() - 1);
            data[dateShow] = {
                year: newDate.getFullYear(),
                month: newDate.getMonth() + 1,
                date: newDate.getDate()
            }
            return;

        }

        // add month
        if ( target.classList.contains('dt-month-add') ) {
            const dateShow: keyof kitContent = status === 'start' ? 'startDateShow' : 'endDateShow';
            // const newDate = new Date(`${data[dateShow].year}-${data[dateShow].month}-${data[dateShow].date}`);
            const newDate = new Date(data[dateShow].year, data[dateShow].month - 1, data[dateShow].date);
            newDate.setMonth(newDate.getMonth() + 1);
            data[dateShow] = {
                year: newDate.getFullYear(),
                month: newDate.getMonth() + 1,
                date: newDate.getDate()
            }
            return;
        }

        // show month select box
        if ( target.classList.contains('dt-month-text') || target.parentElement?.classList.contains('dt-month-text')) {
            ele.querySelector('.dt-month-select')!.innerHTML = renderSelectList(data, status);
            
            ele.classList.add('dt-month-select-show');
            setTimeout(() => {
                ele.querySelectorAll('.dt-month-item-active').forEach( (e) => {
                    // e.scrollIntoView({
                    //     block: 'start',
                    //     inline: 'center',
                    //     behavior: 'smooth'
                    // });
                    e.parentElement!.scrollTo({
                        top: (e as HTMLElement).offsetTop - 10,
                        behavior: 'smooth'
                    })
                });
            }, 200);
            return ;
        }

        // hide month select box
        if ( target.classList.contains('dt-month-mask') ) {
            ele.classList.remove('dt-month-select-show');
            return ;
        }

         // select year
         if ( target.classList.contains('dt-year-item') ) {
            const dateShow: keyof kitContent = status === 'start' ? 'startDateShow' : 'endDateShow';
            data[dateShow] = {
                ...data[dateShow],
                year: parseInt(target.getAttribute('data-year') as string),
            }

            target.parentElement!.querySelector('.dt-month-item-active')?.classList.remove('dt-month-item-active');
            target.classList.add('dt-month-item-active');
            // target.scrollIntoView({
            //     block: 'start',
            //     inline: 'center',
            //     behavior: 'smooth'
            // });
            target.parentElement!.scrollTo({
                top: target.offsetTop - 10,
                behavior: 'smooth'
            })
            return ;
        }

        // select month
        if ( target.classList.contains('dt-month-item') ) {
            const dateShow: keyof kitContent = status === 'start' ? 'startDateShow' : 'endDateShow';
            
            data[dateShow] = {
                ...data[dateShow],
                month: parseInt(target.getAttribute('data-month') as string),
            }
           
            target.parentElement!.querySelector('.dt-month-item-active')?.classList.remove('dt-month-item-active');
            target.classList.add('dt-month-item-active');
            // target.scrollIntoView({
            //     block: 'start',
            //     inline: 'nearest',
            //     behavior: 'smooth'
            // });
            // console.log(target.scrollTop,' ====')
            target.parentElement!.scrollTo({
                top: target.offsetTop - 10,
                behavior: 'smooth'
            })
            return ;
        }
        
       
    });
    return ele;
}

/**
 * Render the month select box
 * @param data - the data of date picker
 * @param status - the status of date picker, default is "start"
 * @returns the element of month select box
 */
function render(data: kitContent, status: status) {
   
    // let showDate: Date | null = null;
    
    // if ( status === 'start' && data.startDateShow.year ) {
    //     // render start month
    //     showDate = new Date(`${data.startDateShow.year}-${data.startDateShow.month}-${data.startDateShow.date}`);
    // }

    // if ( status === 'start' && !data.startDateShow.year ) {
    //     // render current month
    //     showDate = new Date();
    // }
    
    // if ( status === 'end' && data.endDateShow.year ) {
    //     // render end month
    //     showDate = new Date(`${data.endDateShow.year}-${data.endDateShow.month}-${data.endDateShow.date}`);
    // }

    // if ( status === 'end' && !data.endDateShow.year ) {
    //     if ( data.startDateShow.year ) {
    //         // render next month of start month
    //         showDate = new Date(`${data.startDateShow.year}-${data.startDateShow.month}-${data.startDateShow.date}`);
    //     } else {
    //         // render next month of current month
    //         showDate = new Date();
    //     }
    //     // add one month, to get next month
    //     showDate.setMonth(showDate.getMonth() + 1);
    // }


    // if ( showDate === null ) {
    //     showDate = new Date();
    // }
    // let year = showDate.getFullYear()
    // let month = showDate.getMonth()  + 1;
    const dataKey = status === 'start' ? 'startDateShow' : 'endDateShow';

    return `
        <div class="dt-month-sub-box">
            <div class="dt-month-year-sub"></div>
            <div class="dt-month-sub"></div>
        </div>
        <div class="dt-month-text">
            

            <div class="dt-month-title">${data[dataKey].month}/${data[dataKey].year}</div>
            <div class="dt-month-icon"></div>
            <div class="dt-month-select">
                ${renderSelectList(data, status)}
            </div>
        </div>
        <div class="dt-month-add-box">
            <div class="dt-month-add"></div>
            <div class="dt-month-year-add"></div>
        </div>
        <div class="dt-month-mask"></div>
    `;
}

function renderSelectList(data: kitContent,  status: status) {
    const dataKey = status === 'start' ? 'startDateShow' : 'endDateShow';
    const year = data[dataKey].year;
    const month = data[dataKey].month;
   
    // render month
    let monthHTML = '';
    for ( let i = 1; i <= 12; i++ ) {
        
        const classList = ['dt-month-item'];
        if ( i === month ) {
            classList.push('dt-month-item-active');
        }
        
        if ( status === 'start'  ) {
            if ( year === data.maxDate.year && i > data.maxDate.month ) {
                classList.push('dt-month-item-disabled');
            }
            if ( year === data.minDate.year && i < data.minDate.month ) {
                classList.push('dt-month-item-disabled');
            }
            if ( year < data.minDate.year ) {
                classList.push('dt-month-item-disabled');
            }
            if ( year > data.maxDate.year ) {
                classList.push('dt-month-item-disabled');
            }
        }
        if ( status === 'end'  ) {
            if ( year === data.maxDate.year && i > data.maxDate.month ) {
                classList.push('dt-month-item-disabled');
            }
            if ( year === data.minDate.year && i < data.minDate.month ) {
                classList.push('dt-month-item-disabled');
            }
            if ( year < data.minDate.year ) {
                classList.push('dt-month-item-disabled');
            }
            if ( year > data.maxDate.year ) {
                classList.push('dt-month-item-disabled');
            }
        }

        monthHTML += `
            <div class="${classList.join(' ')}" data-month="${i}">${i}</div>
        `;

        
    }

    // render year
    let yearHTML = '';
    for ( let i = data.maxDate.year; i >= data.minDate.year; i-- ) {

        const classList = ['dt-month-item'];
        if ( i === year ) {
            classList.push('dt-month-item-active');
        }
        
        if ( status === 'start'  ) {
            if ( year === data.maxDate.year && i > data.maxDate.month ) {
                classList.push('dt-month-item-disabled');
            }
            if ( year === data.minDate.year && i < data.minDate.month ) {
                classList.push('dt-month-item-disabled');
            }
            if ( year < data.minDate.year ) {
                classList.push('dt-month-item-disabled');
            }
            if ( year > data.maxDate.year ) {
                classList.push('dt-month-item-disabled');
            }
        }
        if ( status === 'end'  ) {
            if ( year === data.maxDate.year && i > data.maxDate.month ) {
                classList.push('dt-month-item-disabled');
            }
            if ( year === data.minDate.year && i < data.minDate.month ) {
                classList.push('dt-month-item-disabled');
            }
            if ( year < data.minDate.year ) {
                classList.push('dt-month-item-disabled');
            }
            if ( year > data.maxDate.year ) {
                classList.push('dt-month-item-disabled');
            }
        }
        yearHTML += `
            <div class="dt-year-item ${classList.join(' ')}" data-year="${i}">${i}</div>
        `;
    }


    return `
            <div class="dt-month-select-li">
                ${monthHTML}
            </div>
            <div class="dt-month-select-li">
                ${yearHTML}
            </div>
        `;
}


/**
 * Updates the month box element with the given kitContent data.
 * @param ele The element to be updated.
 * @param data The kitContent data to be rendered.
 */
export function updateData(ele: HTMLElement, data: kitContent) {
    const status = ele.getAttribute('data-status') as status;
    const dateShow: keyof kitContent = status === 'start' ? 'startDateShow' : 'endDateShow';
    // set title and box
    ele.querySelector('.dt-month-title')!.innerHTML = `${data[dateShow].month}/${data[dateShow].year}`;


    ele.className = [
        ...getBoxClass(data, status),
        ele.classList.contains('dt-month-select-show') ? 'dt-month-select-show' : ''
    ].join(' ');
    
}

/**
 * Get the class name of the month box, given the kitContent data and status.
 * @param data The kitContent data to be rendered.
 * @param status The status of month box, 'start' or 'end'.
 * @return The class name of the month box.
 */
function getBoxClass(data: kitContent, status: status) {
    const classList = ['dt-month'];

    // hide month switch button
    const classNameM = status === 'start' ? 'dt-month-hide-right-m' : 'dt-month-hide-left-m';
    // hide year switch button
    const classNameY = status === 'start' ? 'dt-year-hide-right-y' : 'dt-year-hide-left-y';

    // let startDate = new Date(`${data.startDateShow.year}-${data.startDateShow.month}`);
    let startDate = new Date(data.startDateShow.year, data.startDateShow.month - 1);
    // const endDate = new Date(`${data.endDateShow.year}-${data.endDateShow.month}`);
    const endDate = new Date(data.endDateShow.year, data.endDateShow.month - 1);
    startDate.setMonth(startDate.getMonth() + 1);
    if ( startDate.getTime() >= endDate.getTime() ) {
        classList.push(classNameM);
    }

    startDate = new Date(`${data.startDateShow.year}-${data.startDateShow.month}`);
    startDate.setFullYear(startDate.getFullYear() + 1);
    if ( startDate.getTime() >= endDate.getTime() ) {
        classList.push(classNameY);
    }

    return classList;

}