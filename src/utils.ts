/**
 * Shows the element by adding the "dt-show" class.
 * @param element - Element to be shown.
 */
export function showBox(element: Element) {
    element.classList.add('dt-show');
}


/**
 * Hides the element by removing the "dt-show" class and then removing the element
 * from the DOM after 350ms.
 * @param element - Element to be hidden.
 */
export function hideBox(element: Element) {
    element.classList.remove('dt-show');
    setTimeout(() => {
        element.parentElement!.removeChild(element);
    }, 350);
}



/**
 * Returns a debounced version of the provided function, ensuring that the 
 * function is only invoked after a specified delay in milliseconds has elapsed 
 * since the last time the debounced function was invoked.
 * 
 * @param fn - The function to debounce.
 * @returns A debounced version of the provided function.
 */

export function debounce(fn: Function) {
    let timer: any;
    return function () {
        clearTimeout(timer);
        timer = setTimeout(() => {
            
            fn();
        }, 10);
    }
}

/**
 * Format a date as a string in the format "YYYY-MM-DD".
 * If the date parameter is undefined, only the year and month are returned.
 * @param year The year of the date.
 * @param date The date of the month. If undefined, only the year and month are returned.
 * @returns The formatted date string.
 */

export function getDateTimeStr(year: number, month: number, date: number | undefined = undefined): string {
    if ( date === undefined ) {
        return `${year.toString().padStart(4, '0')}-${month.toString().padStart(2, '0')}`;
    }
    return `${year.toString().padStart(4, '0')}-${month.toString().padStart(2, '0')}-${date.toString().padStart(2, '0')}`;
}


export function getTimeStr (hour: number, minute: number, second: number, millisecond: number): string {

    return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}:${second.toString().padStart(2, '0')}:${millisecond.toString().padStart(3, '0')}`;
}