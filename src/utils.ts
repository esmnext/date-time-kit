export function showBox(element: Element) {
    element.classList.add('dt-show');
}

export function hideBox(element: Element) {
    element.classList.remove('dt-show');
    setTimeout(() => {
        element.parentElement!.removeChild(element);
    }, 350);
}

export function debounce(fn: Function) {
    let timer: any;
    return function () {
        clearTimeout(timer);
        timer = setTimeout(() => {
            
            fn();
        }, 10);
    }
}