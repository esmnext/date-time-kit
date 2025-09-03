import type { kitContent, status } from '../types';
import { initKitDate, kitDate2Date } from '../utils';
import './month.scss';

/**
 * Create a month select box
 * @param data the data of date picker
 * @param status the status of date picker, default is `start`
 * @returns the element of month select box
 */
export function create(data: kitContent, status: status = 'start') {
    const ele = document.createElement('div');
    ele.classList.add(...getBoxClass(data, status));
    ele.setAttribute('data-status', status);
    ele.innerHTML = render(data, status);

    // add event
    ele.addEventListener('click', (e) => {
        const target = e.target;
        if (!(target instanceof HTMLElement)) return;
        const dateShow: keyof kitContent =
            status === 'start' ? 'startDateShow' : 'endDateShow';
        const oldDate = kitDate2Date(data[dateShow]);

        // sub year
        if (target.classList.contains('dt-month-year-sub')) {
            oldDate.setFullYear(oldDate.getFullYear() - 1);
            data[dateShow] = initKitDate(oldDate);
            return;
        }

        // add year
        if (target.classList.contains('dt-month-year-add')) {
            oldDate.setFullYear(oldDate.getFullYear() + 1);
            data[dateShow] = initKitDate(oldDate);
            return;
        }

        // sub month
        if (target.classList.contains('dt-month-sub')) {
            oldDate.setMonth(oldDate.getMonth() - 1);
            data[dateShow] = initKitDate(oldDate);
            return;
        }

        // add month
        if (target.classList.contains('dt-month-add')) {
            oldDate.setMonth(oldDate.getMonth() + 1);
            data[dateShow] = initKitDate(oldDate);
            return;
        }

        // show month select box
        if (
            target.classList.contains('dt-month-text') ||
            target.parentElement?.classList.contains('dt-month-text')
        ) {
            const selector = ele.querySelector('.dt-month-select');
            if (selector) selector.innerHTML = renderSelectList(data, status);

            ele.classList.add('dt-month-select-show');
            setTimeout(() => {
                ele.querySelectorAll('.dt-month-item-active').forEach((e) => {
                    e.parentElement?.scrollTo({
                        top: (e as HTMLElement).offsetTop - 10,
                        behavior: 'smooth'
                    });
                });
            }, 200);
            return;
        }

        // hide month select box
        if (target.classList.contains('dt-month-mask')) {
            ele.classList.remove('dt-month-select-show');
            return;
        }

        // select year
        if (target.classList.contains('dt-year-item')) {
            oldDate.setFullYear(Number.parseInt(target.dataset.year as string));
            data[dateShow] = initKitDate(oldDate);

            target.parentElement
                ?.querySelector('.dt-month-item-active')
                ?.classList.remove('dt-month-item-active');
            target.classList.add('dt-month-item-active');
            target.parentElement?.scrollTo({
                top: target.offsetTop - 10,
                behavior: 'smooth'
            });
            return;
        }

        // select month
        if (target.classList.contains('dt-month-item')) {
            oldDate.setMonth(
                Number.parseInt(target.dataset.month as string) - 1
            );
            data[dateShow] = initKitDate(oldDate);

            target.parentElement
                ?.querySelector('.dt-month-item-active')
                ?.classList.remove('dt-month-item-active');
            target.classList.add('dt-month-item-active');
            target.parentElement?.scrollTo({
                top: target.offsetTop - 10,
                behavior: 'smooth'
            });
            return;
        }
    });
    return ele;
}

/**
 * Render the month select box
 * @param data the data of date picker
 * @param status the status of date picker
 * @returns the element of month select box
 */
function render(data: kitContent, status: status) {
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

function renderSelectList(data: kitContent, status: status) {
    const dataKey = status === 'start' ? 'startDateShow' : 'endDateShow';
    const year = data[dataKey].year;
    const month = data[dataKey].month;

    // render month
    let monthHTML = '';
    for (let i = 1; i <= 12; i++) {
        const classList = ['dt-month-item'];

        if (i === month) classList.push('dt-month-item-active');

        if (
            (year === data.maxDate.year && i > data.maxDate.month) ||
            (year === data.minDate.year && i < data.minDate.month) ||
            year < data.minDate.year ||
            year > data.maxDate.year
        )
            classList.push('dt-month-item-disabled');

        monthHTML += `<div class="${classList.join(' ')}" data-month="${i}">${i}</div>`;
    }

    // render year
    let yearHTML = '';
    for (let i = data.maxDate.year; i >= data.minDate.year; i--) {
        const classList = ['dt-month-item'];

        if (i === year) classList.push('dt-month-item-active');

        if (
            (year === data.maxDate.year && i > data.maxDate.month) ||
            (year === data.minDate.year && i < data.minDate.month) ||
            year < data.minDate.year ||
            year > data.maxDate.year
        )
            classList.push('dt-month-item-disabled');

        yearHTML += `<div class="dt-year-item ${classList.join(' ')}" data-year="${i}">${i}</div>`;
    }

    return `<div class="dt-month-select-li">${
        monthHTML
    }</div><div class="dt-month-select-li">${yearHTML}</div>`;
}

/**
 * Updates the month box element with the given kitContent data.
 * @param ele The element to be updated.
 * @param data The kitContent data to be rendered.
 */
export function updateData(ele: HTMLElement, data: kitContent) {
    const status = ele.getAttribute('data-status') as status;
    const dateShow: keyof kitContent =
        status === 'start' ? 'startDateShow' : 'endDateShow';
    // set title and box
    const title = ele.querySelector('.dt-month-title');
    if (title)
        title.innerHTML = `${data[dateShow].month}/${data[dateShow].year}`;

    ele.className = [
        ...getBoxClass(data, status),
        ele.classList.contains('dt-month-select-show')
            ? 'dt-month-select-show'
            : ''
    ].join(' ');
}

/**
 * Get the class name of the month box, given the kitContent data and status.
 * @param data The kitContent data to be rendered.
 * @param status The status of month box.
 * @return The class name of the month box.
 */
function getBoxClass(data: kitContent, status: status) {
    const classList = ['dt-month'];
    if (!data.period) return classList;

    const pos = {
        start: 'right',
        end: 'left'
    };

    // hide month switch button
    const classNameM = `dt-month-hide-${pos[status]}-m`;
    // hide year switch button
    const classNameY = `dt-year-hide-${pos[status]}-y`;

    let startDate = new Date(
        data.startDateShow.year,
        data.startDateShow.month - 1
    );
    const endDate = new Date(data.endDateShow.year, data.endDateShow.month - 1);
    startDate.setMonth(startDate.getMonth() + 1);
    if (startDate >= endDate) classList.push(classNameM);

    startDate = new Date(
        `${data.startDateShow.year}-${data.startDateShow.month}`
    );
    startDate.setFullYear(startDate.getFullYear() + 1);
    if (startDate >= endDate) classList.push(classNameY);

    return classList;
}
