import { debounce, html } from "@/utils";
import { BaseAttrs, CustomEleEventListener, DefEle, UiBase } from "@/components/web-component-base";
import { NumListEle } from "../num-list";
import styleStr from './index.scss?inline';

export interface DateListGroupAttrs extends BaseAttrs {
    'millisecond': number;
    // 'max-millisecond'?: number;
    // 'min-millisecond'?: number;
    /**
     * 选择器的粒度，表示最大可选的时间单位。默认为 year。
     * 例如设置为 'month'，则表示最大只能选择到月份，年将被忽略。
     */
    'max-granularity'?: 'year' | 'month' | 'day';
    /**
     * 选择器的粒度，表示最小可选的时间单位。默认为 second。
     * 例如设置为 'month'，则表示只能选择到月份，日会将被忽略。
     */
    'min-granularity'?: 'year' | 'month' | 'day';
    'col-order'?: 'ymd' | 'ydm' | 'myd' | 'mdy' | 'dym' | 'dmy';
}

export type DateListGroupEmit = (eventName: 'change', detail: {
    oldMs: number;
    newMs: number;
}) => void;

/**
 * 日期选择器
 */
@DefEle('yyyymmdd-list-group')
export class DateListGroup extends UiBase<DateListGroupAttrs, DateListGroupEmit> {
    static get observedAttributes(): string[] {
        return [
            ...(super.observedAttributes as (keyof BaseAttrs)[]),
            'millisecond',
            'max-granularity',
            'min-granularity',
            'col-order',
        ] satisfies (keyof DateListGroupAttrs)[];
    }

    protected _style = styleStr;
    protected _template = html`
        <div class="cols" part="cols">
            <div class="col" part="col year">
                <span>Year</span>
                <dt-num-list part="list year" class="year"></dt-num-list>
            </div>
            <div class="col" part="col month">
                <span>Month</span>
                <dt-num-list part="list month" class="month" min-num="1" max-num="12"></dt-num-list>
            </div>
            <div class="col" part="col day">
                <span>Day</span>
                <dt-num-list part="list day" class="day" min-num="1" max-num="31"></dt-num-list>
            </div>
        </div>
    `;

    constructor() {
        super();
        this._applyTemplate();
    }

    private get _listEleYear() {
        return this.shadowRoot?.querySelector('.cols .year') as NumListEle;
    }
    private get _listEleMonth() {
        return this.shadowRoot?.querySelector('.cols .month') as NumListEle;
    }
    private get _listEleDay() {
        return this.shadowRoot?.querySelector('.cols .day') as NumListEle;
    }

    public get millisecond() {
        return Math.floor(+this._getAttr('millisecond', '0'));
    }
    public set millisecond(v: number) {
        if (!Number.isSafeInteger(v)) return;
        this.setAttribute('millisecond', '' + Math.floor(v));
    }
    public get maxGranularity() {
        return this._getAttr('max-granularity', 'year') as 'year' | 'month' | 'day';
    }
    public set maxGranularity(v: 'year' | 'month' | 'day') {
        if (!['year', 'month', 'day'].includes(v)) return;
        this.setAttribute('max-granularity', v);
    }
    public get minGranularity() {
        return this._getAttr('min-granularity', 'day') as 'year' | 'month' | 'day';
    }
    public set minGranularity(v: 'year' | 'month' | 'day') {
        if (!['year', 'month', 'day'].includes(v)) return;
        this.setAttribute('min-granularity', v);
    }
    public get colOrder() {
        return this._getAttr('col-order', 'dmy') as 'ymd' | 'ydm' | 'myd' | 'mdy' | 'dym' | 'dmy';
    }
    public set colOrder(v: 'ymd' | 'ydm' | 'myd' | 'mdy' | 'dym' | 'dmy') {
        if (!['ymd', 'ydm', 'myd', 'mdy', 'dym', 'dmy'].includes(v)) return;
        this.setAttribute('col-order', v);
    }

    public connectedCallback() {
        if (!this.shadowRoot) return;
        this._listEleYear.formatter = (num) => '' + num;
        this._listEleMonth.formatter =
        this._listEleDay.formatter = (num) => ('0' + num).slice(-2);

        this._renderCols();
        this._updateGranularity();
        this._updateColsValue();

        this._listEleYear.addEventListener('select-num', this._onColsSelect);
        this._listEleMonth.addEventListener('select-num', this._onColsSelect);
        this._listEleDay.addEventListener('select-num', this._onColsSelect);
    }
    public disconnectedCallback() {
        if (!this.shadowRoot) return;
        this._listEleYear.removeEventListener('select-num', this._onColsSelect);
        this._listEleMonth.removeEventListener('select-num', this._onColsSelect);
        this._listEleDay.removeEventListener('select-num', this._onColsSelect);
    }

    public attributeChangedCallback(name: string, oldValue: string, newValue: string) {
        super.attributeChangedCallback(name, oldValue, newValue);
        if (oldValue === newValue) return;
        if (name === 'col-order') this._renderCols();
        else if (name === 'max-granularity' || name === 'min-granularity') this._updateGranularity();
        else if (name === 'millisecond') this._updateColsValue();
    }

    private _renderCols = debounce(() => {
        if (!this.shadowRoot) return;
        const { colOrder } = this;
        // columns order
        const orderedCols = [];
        for (const c of colOrder) {
            if (c === 'y') orderedCols.push(this._listEleYear);
            else if (c === 'm') orderedCols.push(this._listEleMonth);
            else if (c === 'd') orderedCols.push(this._listEleDay);
        }
        const colsContainer = this.shadowRoot.querySelector<HTMLElement>('.cols')!;
        // return if order not changed
        if (!orderedCols.every((el, i) => el === colsContainer.children[i])) return;
        colsContainer.innerHTML = '';
        colsContainer.append(...orderedCols);
    }, 0);

    private _updateGranularity = debounce(() => {
        if (!this.shadowRoot) return;
        const { maxGranularity, minGranularity } = this;
        const colsContainer = this.shadowRoot.querySelector<HTMLElement>('.cols')!;
        const yEle = this.shadowRoot.querySelector<HTMLElement>('.col .year')!;
        const mEle = this.shadowRoot.querySelector<HTMLElement>('.col .month')!;
        const dEle = this.shadowRoot.querySelector<HTMLElement>('.col .day')!
        const granularityMap = { year: 3, month: 2, day: 1 };
        let maxG = granularityMap[maxGranularity] ?? 1;
        let minG = granularityMap[minGranularity] ?? 3;
        if (maxG < minG) [maxG, minG] = [minG, maxG];
        yEle.style.display = (maxG >= 3 && minG <= 3) ? '' : 'none';
        mEle.style.display = (maxG >= 2 && minG <= 2) ? '' : 'none';
        dEle.style.display = (maxG >= 1 && minG <= 1) ? '' : 'none';
        colsContainer.style.display =
            [yEle, mEle, dEle].filter(ele => ele.style.display !== 'none').length ? '' : 'none';
    }, 0);

    private _updateColsValue = debounce(() => {
        if (!this.shadowRoot) return;
        const { millisecond } = this;
        const date = new Date(millisecond);
        if (isNaN(date.getTime())) return;
        this._listEleYear.currentNum = date.getFullYear();
        this._listEleMonth.currentNum = date.getMonth() + 1;
        this._listEleDay.maxNum = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
        this._listEleDay.currentNum = date.getDate();
    }, 0);

    private _getMsFromEle() {
        const month = this._listEleMonth.currentNum;
        const date = new Date(
            this._listEleYear.currentNum,
            month - 1,
            this._listEleDay.currentNum
        );
        if (date.getMonth() + 1 !== month) {
            // 日期不符合预期，可能是因为月份天数不够
            // 例如 2021-02-30，Date 对象会自动调整为 2021-03-02
            // 这里需要将日期设置为该月的最后一天
            date.setDate(0);
        }
        return +date;
    }

    private _onColsSelect: CustomEleEventListener<NumListEle, 'select-num'> =
        ({ target, detail: { newNum } }) => {
            if (!(target instanceof NumListEle)) return;
            target.currentNum = newNum;
            const oldMs = this.millisecond;
            const newMs = this._getMsFromEle();
            this.millisecond = newMs;
            this.dispatchEvent('change', {
                oldMs,
                newMs: this.millisecond
            }, true);
        };
}
