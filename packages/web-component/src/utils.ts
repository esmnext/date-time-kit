export const html = (strings: TemplateStringsArray, ...values: unknown[]) =>
    String.raw(strings, ...values);
export const css = html;

export const closestByEvent = (
    e: Event,
    selector: string,
    root?: HTMLElement | ShadowRoot
) => {
    for (const target of e.composedPath()) {
        if (target === root) return null;
        if (!(target instanceof HTMLElement)) continue;
        if (target.matches(selector)) {
            return target;
        }
    }
    return null;
};

/**
 * Returns a debounced version of the provided function, ensuring that the
 * function is only invoked after a specified delay in milliseconds has elapsed
 * since the last time the debounced function was invoked.
 *
 * @param fn - The function to debounce.
 * @returns A debounced version of the provided function.
 */
export function debounce(fn: Function, delay = 0) {
    let timer: ReturnType<typeof setTimeout> | null = null;
    return function <U>(this: U, ...args: any[]) {
        if (timer !== null) clearTimeout(timer);
        timer = setTimeout(() => {
            fn.apply(this, args);
        }, delay);
    };
}

export const getCurrentTz = () => -new Date().getTimezoneOffset();
export const getCurrentTzMs = () => getCurrentTz() * 60 * 1000;
