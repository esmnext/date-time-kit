import './box.scss';
import { kitComponentOption, kitContent, kitDate, kitOption, kitResultPeriod, kitResultSingle, kitTime, timeString } from '../types';
import * as quick from './quick';
import * as month from './month';
import * as date from './date';
import * as time from './time';
import * as utils from '../utils';
import i18n from '../i18n';

/** create date time picker */
export const create = ({ root }: kitOption, data: kitContent) =>
    new Promise<kitResultPeriod | kitResultSingle>((resolve, reject) => {
        const components: kitComponentOption[] = [];

        if (root.querySelector('.dt-box')) {
            return reject("Date time picker has been created");
        }
        // debounce
        const updateDataDebounce = utils.debounce(() => {
            updateData(eleBox, dataProxy);
            components.forEach(item => {
                item.component.updateData(item.ele, dataProxy);
            })
        })
        // watch data
        const dataProxy = new Proxy(data, {
            set(target, _key, value) {
                const key = _key as keyof kitContent;
                // if data is the same, return
                let flag = false;
                if (typeof target[key] === 'object') {
                    for (const item in target[key] as kitDate | kitTime) {
                        if (target[key][item as keyof (kitDate | kitTime)] !== value[item]) {
                            flag = true;
                            break;
                        }
                    }
                } else {
                    if (target[key] !== value) {
                        flag = true;
                    }
                }

                if (!flag) {
                    return true;
                }

                // eslint-disable-next-line
                (target as any)[key] = value;

                // send new data to components
                updateDataDebounce();
                return true;
            }
        });

        /************************************************
         *  @description create components
         ************************************************/

        const eleBox = document.createElement('div');
        eleBox.classList.add('dt-box');
        eleBox.innerHTML = render(data);
        root.appendChild(eleBox);

        // create mask
        const eleMask = document.createElement('div');
        eleMask.classList.add('dt-mask');
        document.body.appendChild(eleMask);
        // compute position
        if (window.innerWidth > 768) {
            const rect = root.getBoundingClientRect();
            eleBox.style.top = `${rect.height + 5}px`;
        }
        // update ui status
        updateData(eleBox, dataProxy);


        if (data.period) {
            // add quick select list
            const eleQuick = quick.create(dataProxy);
            eleBox.insertBefore(eleQuick, eleBox.querySelector('.dt-content'));
            components.push({
                ele: eleQuick,
                component: quick
            });
        }


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

        if (data.period) {
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
        }


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
            // document.removeEventListener('click', cancel);
            eleMask.removeEventListener('click', cancel);
            eleBox.removeEventListener('click', eventLoop);
        }
        /**
         * Hide the box and cancel the promise when user click outside of box.
         */
        function cancel() {
            removeEventListener();
            utils.hideBox(eleBox);
            utils.hideBox(eleMask);
            reject("cancel");
        }


        /**
         * Resolve the promise and hide the box when user click confirm button.
         */
        function done() {
            removeEventListener();
            utils.hideBox(eleBox);
            utils.hideBox(eleMask);

            const startDate = utils.getKitTimeByTimeZone({
                date: dataProxy.startDate,
                time: dataProxy.startTime
            }, dataProxy.timeZone);
            const endDate = utils.getKitTimeByTimeZone({
                date: dataProxy.endDate,
                time: dataProxy.endTime
            }, dataProxy.timeZone);


            const startTime: timeString = utils.getTimeString(startDate.date, startDate.time);

            // const startTime = utils.getTimeString(startDate);
            // const endTime = utils.getTimeString(endDate);
            if (data.period) {
                const endTime: timeString = utils.getTimeString(endDate.date, endDate.time);
                resolve({
                    startTime,
                    endTime,
                    quick: quick.getLimitKey(dataProxy),
                    startTimeStamp: new Date(startTime).getTime(),
                    endTimeStamp: new Date(endTime).getTime(),
                    timeZone: dataProxy.timeZone
                });
            } else {
                resolve({
                    time: startTime,
                    timeStamp: new Date(startTime).getTime(),
                    timeZone: dataProxy.timeZone
                });
            }

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
                if (target.classList.contains('dt-button-disabled')) {
                    return;
                }
                done();
            }
        }
        // add event
        eleBox.addEventListener('click', eventLoop);
        // document.addEventListener('click', cancel);
        eleMask.addEventListener('click', cancel);
        // show box 
        utils.showBox(eleBox);
    });



/**
 * Renders the HTML structure for the datetime picker component.
 * 
 * @returns The HTML markup for the datetime picker, including
 * the date selection boxes for start and end dates, a time selection box,
 * and footer buttons for 'Cancel' and 'Done' actions.
 */
function render(data: kitContent): string {
    return `
         <div class="dt-content">
            <div class="dt-date-box">
                <div class="dt-start dt-data-body"></div>
                ${data.period ? `<div class="dt-end dt-data-body"></div>` : ''}
            </div>
            <div class="dt-time-box"></div>
            <div class="dt-footer">
                <button class="dt-button dt-button-cancel">${i18n[data.lang].box.cancel}</button>
                <button class="dt-button dt-button-primary">${i18n[data.lang].box.confirm}</button>
            </div>
         </div>
    `;
}


export function updateData(ele: HTMLElement, data: kitContent) {
    // ele.innerHTML = render(data);
    const doneButton = ele.querySelector('.dt-button-primary')!;
    if (!data.period) {
        if (!data.startDate.date) {
            doneButton.classList.add('dt-button-disabled');
            return;
        }
        doneButton.classList.remove('dt-button-disabled');
        return;
    }
    if (!data.endDate.year) {
        doneButton.classList.add('dt-button-disabled');
        return;
    }
    if (data.moveDate.year) {
        doneButton.classList.add('dt-button-disabled');
        return;
    }


    doneButton.classList.remove('dt-button-disabled');
}
