import { Ele as NumListEle, type EventMap as NumListEvent } from '../num-list';
import { type BaseAttrs, type BaseEmits, UiBase } from '../web-component-base';
import { baseCss } from './css';
import { baseHtml } from './html';

export const granularityList = ['year', 'month', 'day'] as const;
export type Granularity = (typeof granularityList)[number];

export const colOrderList = ['ymd', 'ydm', 'myd', 'mdy', 'dym', 'dmy'] as const;
export type ColOrder = (typeof colOrderList)[number] & {
    [Symbol.iterator](): IterableIterator<'y' | 'm' | 'd'>;
};

export interface Attrs extends BaseAttrs {
    millisecond: number;
    // 'max-millisecond'?: number;
    // 'min-millisecond'?: number;
    /**
     * 选择器的粒度，表示最大可选的时间单位。默认为 year。
     * 例如设置为 'month'，则表示最大只能选择到月份，年将被忽略。
     */
    'max-granularity'?: Granularity;
    /**
     * 选择器的粒度，表示最小可选的时间单位。默认为 second。
     * 例如设置为 'month'，则表示只能选择到月份，日会将被忽略。
     */
    'min-granularity'?: Granularity;
    'col-order'?: ColOrder;
}

export type { BaseEmits };

/** 日期选择器 */
export class BaseEle<A extends Attrs, E extends BaseEmits> extends UiBase<
    A,
    E
> {
    protected static _style = baseCss;
    protected static _template = baseHtml;

    static get observedAttributes(): string[] {
        return [
            ...(super.observedAttributes as (keyof BaseAttrs)[]),
            'millisecond',
            'max-granularity',
            'min-granularity',
            'col-order'
        ] satisfies (keyof Attrs)[];
    }

    public get millisecond() {
        return Math.floor(+this._getAttr('millisecond', '0'));
    }
    public set millisecond(v: number) {
        if (!Number.isSafeInteger(v)) return;
        this.setAttribute('millisecond', '' + Math.floor(v));
    }
    public get maxGranularity() {
        return this._getAttr('max-granularity', 'year') as Granularity;
    }
    public set maxGranularity(v: Granularity) {
        if (!granularityList.includes(v)) return;
        this.setAttribute('max-granularity', v);
    }
    public get minGranularity() {
        return this._getAttr('min-granularity', 'day') as Granularity;
    }
    public set minGranularity(v: Granularity) {
        if (!granularityList.includes(v)) return;
        this.setAttribute('min-granularity', v);
    }
    public get colOrder() {
        return this._getAttr('col-order', 'dmy') as ColOrder;
    }
    public set colOrder(v: ColOrder) {
        if (!colOrderList.includes(v)) return;
        this.setAttribute('col-order', v);
    }

    get _staticEls() {
        return {
            ...super._staticEls,
            cols: this.$0`.cols`!,
            yCol: this.$0`.col.year`!,
            mCol: this.$0`.col.month`!,
            dCol: this.$0`.col.day`!,
            lists: this.$<NumListEle>`dt-num-list`!,
            yList: this.$0<NumListEle>`dt-num-list.year`!,
            mList: this.$0<NumListEle>`dt-num-list.month`!,
            dList: this.$0<NumListEle>`dt-num-list.day`!
        } as const;
    }

    public scrollToCurrentItem() {
        this._els.lists.forEach((e) => e.scrollToCurrent());
    }

    public connectedCallback(): boolean | void {
        if (!super.connectedCallback()) return;
        const { _els } = this;
        _els.mList.formatter = _els.dList.formatter = (i) =>
            (i < 10 ? '0' : '') + i;

        this._renderCols();
        this._updateGranularity();
        this._updateColsValue();

        this._bindEvt(_els.lists)('select-num', this._onColsSelect);
        return true;
    }

    protected _onAttrChanged(
        name: string,
        oldValue: string | null,
        newValue: string | null
    ) {
        super._onAttrChanged(name, oldValue, newValue);
        if (name === 'max-granularity' || name === 'min-granularity')
            this._updateGranularity();
        else if (name === 'col-order') this._renderCols();
        else if (name === 'millisecond') this._updateColsValue();
    }

    private _renderCols = super._genRenderFn(() => {
        const { _els } = this;
        for (const c of this.colOrder) {
            _els[`${c}Col`].remove();
            _els.cols.appendChild(_els[`${c}Col`]);
        }
    });

    private _updateGranularity = super._genRenderFn(() => {
        const { maxGranularity, minGranularity, _els } = this;
        const granularityMap = { year: 3, month: 2, day: 1 };
        let maxG = granularityMap[maxGranularity] ?? 1;
        let minG = granularityMap[minGranularity] ?? 3;
        if (maxG < minG) [maxG, minG] = [minG, maxG];
        const show = (el: HTMLElement, condition: boolean) =>
            !(el.style.display = condition ? '' : 'none');
        show(
            _els.cols,
            [
                show(_els.yCol, maxG >= 3 && minG <= 3),
                show(_els.mCol, maxG >= 2 && minG <= 2),
                show(_els.dCol, maxG >= 1 && minG <= 1)
            ].some((v) => v)
        );
    });

    private _updateColsValue = super._genRenderFn(() => {
        const { millisecond, _els } = this;
        const date = new Date(millisecond);
        if (Number.isNaN(+date)) return;
        _els.yList.currentNum = date.getFullYear();
        _els.mList.currentNum = date.getMonth() + 1;
        _els.dList.maxNum = new Date(
            date.getFullYear(),
            date.getMonth() + 1,
            0
        ).getDate();
        _els.dList.currentNum = date.getDate();
    });

    private _getMsFromEle() {
        const { _els } = this;
        const month = _els.mList.currentNum;
        const date = new Date(
            _els.yList.currentNum,
            month - 1,
            _els.dList.currentNum
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
