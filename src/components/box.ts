import './box.scss';
import { kitComponentOption, kitContent, kitDate, kitOption, kitResult, kitTime, timeString } from '../../type';
import * as quick from './quick';
import * as month from './month';
import * as date from './date';
import * as time from './time';
import * as utils from '../utils';


/**
 * create date time picker
 * @param {kitOption} options 
 * @param {kitContent} data 
 * @returns {Promise<kitContent>} 
 */
export async function create({ root }: kitOption, data: kitContent): Promise<kitResult> {
    return new Promise(( resolve, reject ) => {
        const components: kitComponentOption[] = [];

        if ( root.querySelector('.dt-box') ) {
            return reject("Date time picker has been created");
        }
        // debounce
        const updateData = utils.debounce(() => {
            console.log('render');
            components.forEach(item => {
                item.component.updateData(item.ele, dataProxy);
            })
        })
        // watch data
        const dataProxy = new Proxy(data, {
            set(target, key, value) {
                // if data is the same, return
                let flag = false;
                if ( typeof target[key as keyof kitContent] === 'object' ) {
                    for ( const item in target[key as keyof kitContent] as kitDate | kitTime ) {
                        if ( target[key as keyof kitContent][item as keyof (kitDate | kitTime)] !== value[item] ) {
                            flag = true;
                            break;
                        }
                    }
                } else {
                    if ( target[key as keyof kitContent] !== value ) {
                        flag = true;
                    }
                }
                

                if ( !flag ) {
                    return true;
                }
                
                target[key as keyof kitContent] = value;
                
                // send new data to components
                updateData();
                return true;
            }
        });

        /************************************************
         *  @description create components
         ************************************************/
       
        const eleBox = document.createElement('div');
        eleBox.classList.add('dt-box');
        eleBox.innerHTML = render();
        root.appendChild(eleBox);

        // compute position
        let rect = root.getBoundingClientRect();
        eleBox.style.top = `${rect.height + 5}px`;

        // add quick select list
        const eleQuick = quick.create(dataProxy);
        eleBox.insertBefore(eleQuick, eleBox.querySelector('.dt-content'));
        components.push({
            ele: eleQuick,
            component: quick
        });

        // add month select for start
        const eleMonthStart = month.create(dataProxy, 'start');
        eleBox.querySelector('.dt-start')!.appendChild(eleMonthStart);
        components.push({
            ele: eleMonthStart,
            component: month
        });

        // add date select for start
        const eleDateStart = date.create(dataProxy, 'start');
        eleBox.querySelector('.dt-start')!.appendChild(eleDateStart);
        components.push({
            ele: eleDateStart,
            component: date
        });

        // add month select for end
        const eleMonthEnd = month.create(dataProxy, 'end');
        eleBox.querySelector('.dt-end')!.appendChild(eleMonthEnd);
        components.push({
            ele: eleMonthEnd,
            component: month
        });

        // add date select for end
        const eleDateEnd = date.create(dataProxy, 'end');
        eleBox.querySelector('.dt-end')!.appendChild(eleDateEnd);
        components.push({
            ele: eleDateEnd,
            component: date
        });

        // add time for box
        const eleTime = time.create(dataProxy);
        eleBox.querySelector('.dt-time-box')!.appendChild(eleTime);
        components.push({
            ele: eleTime,
            component: time
        });

        //********************************
        // event
        //*********************************/
        // add event for box
        function removeEventListener() {
            document.removeEventListener('click', cancel);
            eleBox.removeEventListener('click', eventLoop);
        }
        /**
         * Hide the box and cancel the promise when user click outside of box.
         */
        function cancel() {
            removeEventListener();
            utils.hideBox(eleBox);
            reject("cancel");
        }


        /**
         * Resolve the promise and hide the box when user click confirm button.
         */
        function done() {
            removeEventListener();
            utils.hideBox(eleBox);

            const startTime: timeString = `${dataProxy.startDate.year}-${dataProxy.startDate.month}-${dataProxy.startDate.date} ${dataProxy.startTime.hour}:${dataProxy.startTime.minute}:${dataProxy.startTime.second}:${dataProxy.startTime.millisecond}`;
            const endTime: timeString = `${dataProxy.endDate.year}-${dataProxy.endDate.month}-${dataProxy.endDate.date} ${dataProxy.endTime.hour}:${dataProxy.endTime.minute}:${dataProxy.endTime.second}:${dataProxy.endTime.millisecond}`;
            
            resolve({
                startTime,
                endTime,
                startTimeStamp: new Date(startTime).getTime(),
                endTimeStamp: new Date(endTime).getTime(),
                timeZone: dataProxy.timeZone
            });
        }

        /**
         * Handles click events within the element box. Stops event propagation and checks
         * the target of the click to determine the appropriate action.
         *
         * If the target has the 'dt-button-cancel' class, it invokes the cancel action.
         * If the target has the 'dt-button-primary' class, it invokes the done action.
         *
         * @param e - The mouse event triggered by a click.
         */

        function eventLoop(e: MouseEvent) {
            e.stopPropagation();
            const target = e.target as HTMLElement;
            if (target.classList.contains('dt-button-cancel')) {
                cancel();
            }

            if (target.classList.contains('dt-button-primary')) {
                done();
            }
        }
        // add event
        eleBox.addEventListener('click', eventLoop);
        document.addEventListener('click', cancel);
        // show box 
        utils.showBox(eleBox);
        
    });
}



/**
 * Renders the HTML structure for the datetime picker component.
 * 
 * @returns {string} The HTML markup for the datetime picker, including
 * the date selection boxes for start and end dates, a time selection box, 
 * and footer buttons for 'Cancel' and 'Done' actions.
 */

function render() {
    return `
         <div class="dt-content">
            <div class="dt-date-box">
                <div class="dt-start dt-data-body"></div>
                <div class="dt-end dt-data-body"></div>
            </div>
            <div class="dt-time-box"></div>
            <div class="dt-footer">
                <button class="dt-button dt-button-cancel">Cancel</button>
                <button class="dt-button dt-button-primary">Done</button>
            </div>
         </div>
    `;
}