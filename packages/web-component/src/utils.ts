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

export const getCurrentTzOffset = () => new Date().getTimezoneOffset();
export const getCurrentTzOffsetMs = () => getCurrentTzOffset() * 60 * 1000;

export const cssDirLtrSelector1 = `:-webkit-any(:lang(ae),:lang(ar),:lang(arc),:lang(bcc),:lang(bqi),:lang(ckb),:lang(dv),:lang(fa),:lang(glk),:lang(he),:lang(ku),:lang(mzn),:lang(nqo),:lang(pnb),:lang(ps),:lang(sd),:lang(ug),:lang(ur),:lang(yi))`;
export const cssDirLtrSelector2 = `:-moz-any(:lang(ae),:lang(ar),:lang(arc),:lang(bcc),:lang(bqi),:lang(ckb),:lang(dv),:lang(fa),:lang(glk),:lang(he),:lang(ku),:lang(mzn),:lang(nqo),:lang(pnb),:lang(ps),:lang(sd),:lang(ug),:lang(ur),:lang(yi))`;
export const cssDirLtrSelector3 = `:is(:lang(ae),:lang(ar),:lang(arc),:lang(bcc),:lang(bqi),:lang(ckb),:lang(dv),:lang(fa),:lang(glk),:lang(he),:lang(ku),:lang(mzn),:lang(nqo),:lang(pnb),:lang(ps),:lang(sd),:lang(ug),:lang(ur),:lang(yi))`;

class SmallScreenObserver {
    private _mql?: MediaQueryList;
    public get isSmall() {
        return this._mql?.matches ?? false;
    }
    constructor(thresholds = 750) {
        if (typeof matchMedia === 'undefined') return;
        this._mql = matchMedia(`(max-width: ${thresholds}px)`);
        this._mql.addEventListener('change', this._onMqlChange);
    }
    private _map: Map<HTMLElement, (isSmall: boolean) => void> = new Map();
    private _onMqlChange = (e: MediaQueryListEvent) => {
        const isSmall = e.matches;
        for (const cb of this._map.values()) {
            cb(isSmall);
        }
    };
    public observe(el: HTMLElement, cb: (isSmall: boolean) => void) {
        this._map.set(el, cb);
        cb(this.isSmall);
    }
    public unobserve(el: HTMLElement) {
        this._map.delete(el);
    }
}
export const smallScreenObserver = new SmallScreenObserver(750);
