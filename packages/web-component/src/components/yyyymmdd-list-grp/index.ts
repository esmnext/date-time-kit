import { Ele as NumListEle, type EventMap as NumListEvent } from '../num-list';
NumListEle.define();
import {
    type BaseAttrs,
    type BaseEmits,
    type Emit2EventMap,
    UiBase
} from '../web-component-base';
import styleStr from './index.css';
import html from './index.html';

export interface Attrs extends BaseAttrs {
    millisecond: number;
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

export interface Emits extends BaseEmits {
    change: {
        oldMs: number;
        newMs: number;
    };
}
export type EventMap = Emit2EventMap<Emits>;

/**
 * 日期选择器
 */
export class Ele extends UiBase<Attrs, Emits> {
    public static readonly tagName = 'dt-yyyymmdd-list-grp' as const;
    protected static _style = styleStr;
    protected static _template = html;

    static get observedAttributes(): string[] {
        return [
            ...(super.observedAttributes as (keyof BaseAttrs)[]),
            'millisecond',
            'max-granularity',
            'min-granularity',
            'col-order'
        ] satisfies (keyof Attrs)[];
    }

    get _staticEls() {
        return {
            ...super._staticEls,
            lists: this.$<NumListEle>`dt-num-list`!,
            yList: this.$0<NumListEle>`dt-num-list.year`!,
            mList: this.$0<NumListEle>`dt-num-list.month`!,
            dList: this.$0<NumListEle>`dt-num-list.day`!
        } as const;
    }

    public get millisecond() {
        return Math.floor(+this._getAttr('millisecond', '0'));
    }
    public set millisecond(v: number) {
        if (!Number.isSafeInteger(v)) return;
        this.setAttribute('millisecond', '' + Math.floor(v));
    }
    public get maxGranularity() {
        return this._getAttr('max-granularity', 'year');
    }
    public set maxGranularity(v: 'year' | 'month' | 'day') {
        if (!['year', 'month', 'day'].includes(v)) return;
        this.setAttribute('max-granularity', v);
    }
    public get minGranularity() {
        return this._getAttr('min-granularity', 'day');
    }
    public set minGranularity(v: 'year' | 'month' | 'day') {
        if (!['year', 'month', 'day'].includes(v)) return;
        this.setAttribute('min-granularity', v);
    }
    public get colOrder() {
        return this._getAttr('col-order', 'dmy');
    }
    public set colOrder(v: 'ymd' | 'ydm' | 'myd' | 'mdy' | 'dym' | 'dmy') {
        if (!['ymd', 'ydm', 'myd', 'mdy', 'dym', 'dmy'].includes(v)) return;
        this.setAttribute('col-order', v);
    }

    public scrollToCurrentItem() {
        this._els.lists.forEach((e) => e.scrollToCurrent());
    }

    public connectedCallback() {
        if (!super.connectedCallback()) return;
        const { _els } = this;
        _els.yList.formatter = (num) => '' + num;
        _els.mList.formatter = _els.dList.formatter = (num) =>
            ('0' + num).slice(-2);

        this._renderCols();
        this._updateGranularity();
        this._updateColsValue();

        this._bindEvt(_els.lists)('select-num', this._onColsSelect);
    }

    protected _onAttrChanged(
        name: string,
        oldValue: string | null,
        newValue: string | null
    ) {
        super._onAttrChanged(name, oldValue, newValue);
        if (name === 'col-order') this._renderCols();
        else if (name === 'max-granularity' || name === 'min-granularity')
            this._updateGranularity();
        else if (name === 'millisecond') this._updateColsValue();
    }

    private _renderCols = super._genRenderFn(() => {
        const { colOrder } = this;
        // columns order
        const orderedCols = ['year', 'month', 'day']
            .sort((a, b) => colOrder.indexOf(a[0]) - colOrder.indexOf(b[0]))
            .map((s) => this.$0`.col.${s}`!);
        const colsContainer = this.$0`.cols`!;
        // return if order not changed
        if (orderedCols.every((el, i) => el === colsContainer.children[i]))
            return;
        colsContainer.append(...orderedCols);
    });

    private _updateGranularity = super._genRenderFn(() => {
        const { maxGranularity, minGranularity } = this;
        const colsContainer = this.$0`.cols`!;
        const yEle = this.$0`.col.year`!;
        const mEle = this.$0`.col.month`!;
        const dEle = this.$0`.col.day`!;
        const granularityMap = { year: 3, month: 2, day: 1 };
        let maxG = granularityMap[maxGranularity] ?? 1;
        let minG = granularityMap[minGranularity] ?? 3;
        if (maxG < minG) [maxG, minG] = [minG, maxG];
        yEle.style.display = maxG >= 3 && minG <= 3 ? '' : 'none';
        mEle.style.display = maxG >= 2 && minG <= 2 ? '' : 'none';
        dEle.style.display = maxG >= 1 && minG <= 1 ? '' : 'none';
        colsContainer.style.display = [yEle, mEle, dEle].filter(
            (ele) => ele.style.display !== 'none'
        ).length
            ? ''
            : 'none';
    });

    private _updateColsValue = super._genRenderFn(() => {
        const { millisecond } = this;
        const date = new Date(millisecond);
        if (Number.isNaN(date.getTime())) return;
        this._els.yList.currentNum = date.getFullYear();
        this._els.mList.currentNum = date.getMonth() + 1;
        this._els.dList.maxNum = new Date(
            date.getFullYear(),
            date.getMonth() + 1,
            0
        ).getDate();
        this._els.dList.currentNum = date.getDate();
    });

    private _getMsFromEle() {
        const month = this._els.mList.currentNum;
        const date = new Date(
            this._els.yList.currentNum,
            month - 1,
            this._els.dList.currentNum
        );
        if (date.getMonth() + 1 !== month) {
            // 日期不符合预期，可能是因为月份天数不够
            // 例如 2021-02-30，Date 对象会自动调整为 2021-03-02
            // 这里需要将日期设置为该月的最后一天
            date.setDate(0);
        }
        return +date;
    }

    private _onColsSelect = ({
        target,
        detail: { newNum }
    }: NumListEvent['select-num']) => {
        if (!(target instanceof NumListEle)) return;
        target.currentNum = newNum;
        const oldMs = this.millisecond;
        const newMs = this._getMsFromEle();
        this.millisecond = newMs;
        this.dispatchEvent(
            'change',
            {
                oldMs,
                newMs: this.millisecond
            },
            true
        );
    };
}

Ele.define();
