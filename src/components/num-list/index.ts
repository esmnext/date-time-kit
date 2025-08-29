import { closestByEvent, debounce, html } from "@/utils";
import { BaseAttrs, DefEle, UiBase } from "../web-component-base";
import styleStr from './index.scss?inline';

export interface NumListAttrs extends BaseAttrs {
    /**
     * The current number in the list. The component will scroll to this number when rendered.
     * @type {number}
     */
    'current-num': number;
    /**
     * The minimum number in the list (include). If not set, there is no minimum limit.
     * @type {number}
     * @default -Infinity
     */
    'min-num'?: number;
    /**
     * The maximum number in the list (include). If not set, there is no maximum limit.
     * @type {number}
     * @default Infinity
     */
    'max-num'?: number;
    /**
     * The position to scroll the current number into view.
     * @type {`"center" | "end" | "nearest" | "start"`}
     * @default "start"
     */
    'position'?: ScrollLogicalPosition;
}

export interface NumListEmit {
    'select-num': {
        oldNum: number,
        newNum: number
    };
}

/**
 * 基础的数字列表组件。允许无限滚动。点击后可以滚动定位到当前数字。
 * 
 * 存在一个 formatter 方法，可以重写该方法以自定义数字的显示格式。
 */
@DefEle('num-list')
export default class NumList extends UiBase<NumListAttrs, NumListEmit> {
    static get observedAttributes(): string[] {
        return [
            ...(super.observedAttributes as (keyof BaseAttrs)[]),
            'current-num',
            'min-num',
            'max-num',
        ] satisfies (keyof NumListAttrs)[];
    }

    protected _style = styleStr;
    protected _template = html`<div class="container" part="container"></div>`;

    constructor() {
        super();
        this._applyTemplate();
    }

    private get _containerEle() {
        return this.shadowRoot?.querySelector('.container') as HTMLElement;
    }
    private get _currentItemEle() {
        return this._containerEle.querySelector<HTMLElement>('.item-current');
    }

    public get currentNum() {
        return Number(this._getAttr('current-num'));
    }
    public set currentNum(val: number) {
        this.setAttribute('current-num', String(val));
    }
    public get minNum() {
        return Number(this._getAttr('min-num', '-Infinity'));
    }
    public set minNum(val: number) {
        let min = +val;
        if (Number.isNaN(min)) min = -Infinity;
        if (min > this.maxNum) [this.maxNum, min] = [min, this.maxNum];
        this.setAttribute('min-num', String(val));
    }
    public get maxNum() {
        return Number(this._getAttr('max-num', 'Infinity'));
    }
    public set maxNum(val: number) {
        let max = +val;
        if (Number.isNaN(max)) max = Infinity;
        if (max < this.minNum) [this.minNum, max] = [max, this.minNum];
        this.setAttribute('max-num', String(val));
    }

    private _createItem = (num: number, currentNum = this.currentNum) => {
        const ele = document.createElement('div');
        ele.setAttribute('part', ele.className = 'item');
        ele.classList.toggle('item-current', num === currentNum);
        ele.part.toggle('item-current', num === currentNum);
        ele.dataset.number = num + '';
        ele.textContent = this.formatter(num);
        return ele;
    };

    private _intersectionOb: IntersectionObserver | null = null;
    private _destroyOb() {
        this._intersectionOb?.disconnect();
        this._intersectionOb = null;
    }
    private _initOb() {
        this._destroyOb();
        if (!this.shadowRoot) return;
        this._intersectionOb = new IntersectionObserver(
            (entries: IntersectionObserverEntry[], observer: IntersectionObserver) => {
                const container = this._containerEle;
                const firstItem = container.firstElementChild as HTMLElement;
                const lastItem = container.lastElementChild as HTMLElement;
                for (const { target, isIntersecting } of entries) {
                    if (!isIntersecting) continue;
                    observer.unobserve(target);
                    if (target === this._currentItemEle) {
                        observer.observe(firstItem!);
                        observer.observe(lastItem!);
                    }
                    if (target === firstItem) {
                        this._loadBefore();
                    } else if (target === lastItem) {
                        this._loadAfter();
                    }
                }
            },
            { root: this }
        );
    }

    private _loadBefore = debounce(() => {
        const container = this._containerEle;
        const firstItem = container.firstElementChild as HTMLElement;
        const lastItem = container.lastElementChild as HTMLElement;
        const firstNum = Number(firstItem.dataset.number);
        const curNum = this.currentNum, pageSize = this._pageSize, itemHeight = this._itemHeight;
        console.log(pageSize, this.clientHeight, this._itemHeight);
        const items = [...Array(pageSize * 2)].map(
            (_, i) => this._createItem(firstNum - pageSize * 2 + i, curNum)
        );
        this._intersectionOb?.unobserve(firstItem);
        this._intersectionOb?.unobserve(lastItem);
        const scrollTop = this.scrollTop;
        container.prepend(...items);
        for (let i = 0; i < items.length; ++i) {
            container.removeChild(container.lastElementChild!);
        }
        const addedHeight = items.length * itemHeight;
        this.scrollTo({
            top: scrollTop + addedHeight,
            behavior: 'instant'
        });
        this._intersectionOb?.observe(items[0]);
        this._intersectionOb?.observe(container.lastElementChild!);
    }, 0);
    private _loadAfter = debounce(() => {
        const container = this._containerEle;
        const firstItem = container.firstElementChild as HTMLElement;
        const lastItem = container.lastElementChild as HTMLElement;
        const curNum = this.currentNum, pageSize = this._pageSize, itemHeight = this._itemHeight;
        const lastNum = Number(lastItem.textContent);
        const items = [...Array(pageSize * 2)].map(
            (_, i) => this._createItem(lastNum + i + 1, curNum)
        );
        this._intersectionOb?.unobserve(firstItem);
        this._intersectionOb?.unobserve(lastItem);
        const scrollTop = this.scrollTop;
        container.append(...items);
        for (let i = 0; i < items.length; ++i) {
            container.removeChild(container.firstElementChild!);
        }
        const addedHeight = items.length * itemHeight;
        this.scrollTo({
            top: scrollTop - addedHeight,
            behavior: 'instant'
        });
        this._intersectionOb?.observe(container.firstElementChild!);
        this._intersectionOb?.observe(items[items.length - 1]);
    }, 0);

    public connectedCallback() {
        if (!super.connectedCallback()) return;
        this._render();
        this.addEventListener('click', this._onClick);
    }
    public disconnectedCallback() {
        if (!super.disconnectedCallback()) return;
        this.removeEventListener('click', this._onClick);
        this._destroyOb();
    }

    protected _onAttrChanged(name: string, oldValue: string, newValue: string) {
        super._onAttrChanged(name, oldValue, newValue);
        this._render();
    }

    private get _itemHeight() {
        const container = this._containerEle;
        const items = Array.from(container.querySelectorAll<HTMLElement>('.item'));
        const len = items.length;
        if (len === 1) {
            container.append(this._createItem(0, 1));
        } else if (len === 0) {
            container.append(this._createItem(0, 1), this._createItem(0, 1));
        }
        const h = (container.firstElementChild as HTMLElement).offsetHeight;
        const itemNum = Math.max(2, len);
        const gap = Math.max(0,
            (container.clientHeight - h * itemNum) / (itemNum - 1)
        );
        if (len === 0) {
            container.removeChild(container.lastElementChild!);
            container.removeChild(container.lastElementChild!);
        } else if (len === 1) {
            container.removeChild(container.lastElementChild!);
        }
        return h + gap;
    }
    private get _pageSize() {
        return Math.max(10, Math.ceil(this.clientHeight / this._itemHeight));
    }

    public scrollToCurrent = () => {
        const ele = this._currentItemEle;
        if (!ele) return;
        this._intersectionOb?.observe(ele);
        ele.scrollIntoView({
            block: this._getAttr('position', 'start')
        });
    };

    private _render = debounce(() => {
        if (!this.isConnected) return;
        this._destroyOb();
        const container = this.shadowRoot!.querySelector('.container')!;
        container.innerHTML = '';
        if (!this.hasAttribute('current-num')) return;

        const currentNum = this.currentNum;
        const minNum = this.minNum;
        const maxNum = this.maxNum;

        if (minNum === -Infinity && maxNum === Infinity) {
            this._initOb();
            const pageSize = this._pageSize;
            for (let i = -pageSize * 2; i <= pageSize * 2; ++i) {
                container.appendChild(this._createItem(currentNum + i, currentNum));
            }
        }
        else for (let i = minNum; i <= maxNum; ++i) {
            container.appendChild(this._createItem(i, currentNum));
        }
        setTimeout(this.scrollToCurrent, 0);
    }, 0);

    private _onClick = (e: MouseEvent) => {
        if (!this.isConnected) return;
        const container = this._containerEle;
        const oldCurrent = container.querySelector<HTMLElement>('.item-current');
        const item = closestByEvent(e, '.item', this);
        if (!item || item === oldCurrent) return;
        oldCurrent?.classList.remove('item-current');
        oldCurrent?.part.remove('item-current');
        item.classList.add('item-current');
        item.part.add('item-current');
        this.scrollToCurrent();
        super.dispatchEvent('select-num', {
            oldNum: +(oldCurrent?.dataset.number ?? this.currentNum),
            newNum: +item.dataset.number!,
        }, true);
    };

    public formatter = (num: number) => '' + num;
}
