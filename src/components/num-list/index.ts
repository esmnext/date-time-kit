import { closestByEvent, debounce, html } from "@/utils";
import { BaseAttrs, DefEle, UiBase } from "../web-component-base";
import styleStr from './index.scss?inline';

export interface ListsAttrs extends BaseAttrs {
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

export type ListsEmit = (eventName: 'select-num', detail: {
    oldNum: number, newNum: number
}) => void;

/**
 * 基础的数字列表组件。允许无限滚动。点击后可以滚动定位到当前数字。
 * 
 * 存在一个 formatter 方法，可以重写该方法以自定义数字的显示格式。
 */
@DefEle('num-list')
export class NumListEle extends UiBase<ListsAttrs, ListsEmit> {
    static get observedAttributes(): string[] {
        return [
            ...(super.observedAttributes as (keyof BaseAttrs)[]),
            'current-num',
            'min-num',
            'max-num',
        ] satisfies (keyof ListsAttrs)[];
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
                    if (target === this._currentItemEle) {
                        observer.unobserve(target);
                        observer.observe(firstItem!);
                        observer.observe(lastItem!);
                    }
                    const curNum = this.currentNum, pageSize = this._getPageSize();
                    if (target === firstItem) {
                        const firstNum = Number(firstItem.dataset.number);
                        const items = [...Array(pageSize * 2)].map(
                            (_, i) => this._createItem(firstNum - pageSize * 2 + i, curNum)
                        );
                        observer.unobserve(target);
                        observer.unobserve(lastItem!);
                        const scrollTop = this.scrollTop;
                        container.prepend(...items);
                        for (let i = 0; i < items.length; ++i) {
                            container.removeChild(container.lastElementChild!);
                        }
                        const addedHeight = items.length * (firstItem.offsetHeight + this._itemGap);
                        this.scrollTo({
                            top: scrollTop + addedHeight,
                            behavior: 'instant'
                        });
                        observer.observe(items[0]);
                        observer.observe(container.lastElementChild!);
                    } else if (target === lastItem) {
                        const lastNum = Number(lastItem.textContent);
                        const items = [...Array(pageSize * 2)].map(
                            (_, i) => this._createItem(lastNum + i + 1, curNum)
                        );
                        observer.unobserve(firstItem!);
                        observer.unobserve(target);
                        const scrollTop = this.scrollTop;
                        container.append(...items);
                        for (let i = 0; i < items.length; ++i) {
                            container.removeChild(container.firstElementChild!);
                        }
                        const addedHeight = items.length * (lastItem.offsetHeight + this._itemGap);
                        this.scrollTo({
                            top: scrollTop - addedHeight,
                            behavior: 'instant'
                        });
                        observer.observe(container.firstElementChild!);
                        observer.observe(items[items.length - 1]);
                    } else {
                        observer.unobserve(target);
                    }
                }
            },
            { root: this }
        );
    }

    public connectedCallback() {
        this._render();
        this.addEventListener('click', this._onClick);
        this.addEventListener('resize', this._onResize);
    }
    public disconnectedCallback() {
        this.removeEventListener('click', this._onClick);
        this.removeEventListener('resize', this._onResize);
        this._destroyOb();
    }

    public attributeChangedCallback(name: string, oldValue: string, newValue: string) {
        super.attributeChangedCallback(name, oldValue, newValue);
        if (oldValue === newValue) return;
        this._render();
    }

    private _pageSize = 0;
    private _itemGap = 0;
    private _getPageSize(force = false) {
        if (!this.shadowRoot) return this._pageSize;
        if (this._pageSize && !force) return this._pageSize;
        const container = this._containerEle;
        const items = Array.from(container.querySelectorAll('.item'));
        container.innerHTML = '';
        const tempItem = this._createItem(0, 0);
        container.append(this._createItem(0, 0), tempItem);
        const thisHeight = this.clientHeight;
        let itemHeight = tempItem.offsetHeight;
        const itemGap = this._itemGap = this._containerEle.clientHeight - itemHeight * 2;
        itemHeight = itemHeight + itemGap;
        const pageSize = Math.ceil(thisHeight / itemHeight);
        container.innerHTML = '';
        container.append(...items);
        return this._pageSize = Math.min(10, pageSize);
    }

    private _scrollToCurrent = () => {
        if (!this.shadowRoot) return;
        const ele = this._currentItemEle;
        if (!ele) return;
        this._intersectionOb?.observe(ele);
        ele.scrollIntoView({
            block: this._getAttr('position', 'start')
        });
    }

    private _render = debounce(() => {
        if (!this.shadowRoot) return;
        this._destroyOb();
        const container = this.shadowRoot.querySelector('.container')!;
        container.innerHTML = '';
        if (!this.hasAttribute('current-num')) return;

        const currentNum = this.currentNum;
        const minNum = this.minNum;
        const maxNum = this.maxNum;

        if (minNum === -Infinity && maxNum === Infinity) {
            this._initOb();
            const pageSize = this._getPageSize();
            for (let i = -pageSize * 2; i <= pageSize * 2; ++i) {
                container.appendChild(this._createItem(currentNum + i, currentNum));
            }
        }
        else for (let i = minNum; i <= maxNum; ++i) {
            container.appendChild(this._createItem(i, currentNum));
        }
        setTimeout(this._scrollToCurrent, 0);
    }, 0);

    private _onClick = (e: MouseEvent) => {
        if (!this.shadowRoot) return;
        const container = this._containerEle;
        const oldCurrent = container.querySelector<HTMLElement>('.item-current');
        const item = closestByEvent(e, '.item', this);
        if (!item || item === oldCurrent) return;
        oldCurrent?.classList.remove('item-current');
        oldCurrent?.part.remove('item-current');
        item.classList.add('item-current');
        item.part.add('item-current');
        this._scrollToCurrent();
        super.dispatchEvent('select-num', {
            oldNum: +(oldCurrent?.dataset.number ?? this.currentNum),
            newNum: +item.dataset.number!,
        }, true);
    };

    private _onResize = debounce(() => void this._getPageSize(true), 0);

    public formatter = (num: number) => '' + num;
}
