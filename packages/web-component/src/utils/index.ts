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
export function debounce<F extends (...args: any) => void>(fn: F, delay = 0) {
    let timer: ReturnType<typeof setTimeout> | null = null;
    return function <U>(this: U, ...args: Parameters<F>) {
        if (timer !== null) clearTimeout(timer);
        timer = setTimeout(() => {
            fn.apply(this, args);
        }, delay);
    };
}

export const getCurrentTzOffset = () => new Date().getTimezoneOffset();
export const getCurrentTzOffsetMs = () => getCurrentTzOffset() * 60 * 1000;

/* https://elchininet.github.io/postcss-rtlcss/ */
/* https://lightningcss.dev/playground/#%7B%22minify%22%3Afalse%2C%22customMedia%22%3Afalse%2C%22cssModules%22%3Afalse%2C%22analyzeDependencies%22%3Afalse%2C%22targets%22%3A%7B%22chrome%22%3A4194304%2C%22firefox%22%3A4390912%2C%22safari%22%3A720896%2C%22edge%22%3A5177344%7D%2C%22include%22%3A0%2C%22exclude%22%3A0%2C%22source%22%3A%22%22%2C%22visitorEnabled%22%3Afalse%2C%22visitor%22%3A%22%7B%5Cn%20%20Color(color)%20%7B%5Cn%20%20%20%20if%20(color.type%20%3D%3D%3D%20'rgb')%20%7B%5Cn%20%20%20%20%20%20color.g%20%3D%200%3B%5Cn%20%20%20%20%20%20return%20color%3B%5Cn%20%20%20%20%7D%5Cn%20%20%7D%5Cn%7D%22%2C%22unusedSymbols%22%3A%5B%5D%2C%22version%22%3A%22local%22%7D */
const ltrLangs = `:lang(ae),:lang(ar),:lang(arc),:lang(bcc),:lang(bqi),:lang(ckb),:lang(dv),:lang(fa),:lang(glk),:lang(he),:lang(ku),:lang(mzn),:lang(nqo),:lang(pnb),:lang(ps),:lang(sd),:lang(ug),:lang(ur),:lang(yi)`;
export const cssDirLtrSelector1 = `:-webkit-any(${ltrLangs})`;
export const cssDirLtrSelector2 = `:-moz-any(${ltrLangs})`;
export const cssDirLtrSelector3 = `:is(${ltrLangs})`;
/**
 * 将规则中 :dir(ltr) 转换为可以向下兼容的写法。
 * 注意该方法不会解析 css 字符串，只是简单的字符串替换。
 * 同时会将规则重复三次（体积会增大三倍），分别使用三种不同的选择器以兼容不同浏览器。
 */
export const dirLtr = (rule: string) =>
    rule.replaceAll(':dir(ltr)', cssDirLtrSelector1) +
    rule.replaceAll(':dir(ltr)', cssDirLtrSelector2) +
    rule.replaceAll(':dir(ltr)', cssDirLtrSelector3);

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

export type {
    DateGranularity,
    TimeGranularity,
    DateTimeGranularity
} from './granularity';
export { granHelper } from './granularity';
