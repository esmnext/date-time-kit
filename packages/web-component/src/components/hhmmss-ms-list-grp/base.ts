import { type TimeGranularity, granHelper } from '../../utils';
import { Ele as NumListEle, type EventMap as NumListEvent } from '../num-list';
import {
    type BaseEmits,
    EleCtor,
    EleMixin,
    EleWithProps,
    type MixinEle,
    UiBase,
    enumAttr,
    intAttr,
    minmaxGranAttr
} from '../web-component-base';
import { baseCss } from './css';
import { baseHtml } from './html';

export const granularityList = granHelper.time.list;
export type Granularity = TimeGranularity;

export const colOrderList = ['hms', 'hsm', 'mhs', 'msh', 'shm', 'smh'] as const;
export type ColOrder = (typeof colOrderList)[number] & {
    [Symbol.iterator](): IterableIterator<'h' | 'm' | 's'>;
};

const granAttr = minmaxGranAttr(
    ['minGranularity', 'min-granularity'],
    ['maxGranularity', 'max-granularity'],
    'time'
);

export const props = {
    // maxMillisecond: intAttr('max-millisecond', { min: 0, max: 24 * 60 * 60 * 1000 - 1 }),
    // minMillisecond: intAttr('min-millisecond', { min: 0, max: 24 * 60 * 60 * 1000 - 1 }),

    /** 当前时间的毫秒数，范围为一天内的毫秒数（0 到 86399999），随着用户选择时实时更新 */
    millisecond: intAttr('millisecond', {
        min: 0,
        max: 24 * 60 * 60 * 1000 - 1
    }),
    ...granAttr,
    /**
     * 选择器的粒度，表示最大可选的时间单位。默认为 hour。
     * 例如设置为 'minute'，则表示最大只能选择到分钟，小时将被忽略。
     */
    maxGranularity: granAttr.maxGranularity,
    /**
     * 选择器的粒度，表示最小可选的时间单位。默认为 millisecond。
     * 例如设置为 'minute'，则表示只能选择到分钟，秒和毫秒将被忽略。
     */
    minGranularity: granAttr.minGranularity,
    colOrder: enumAttr('col-order', {
        validValues: colOrderList,
        defaultValue: 'smh'
    })
};

export type { BaseEmits };

/** 时分秒毫秒选择器，基类 */
export const MixinHhmmssBaseEle = <B extends typeof UiBase = typeof UiBase>(
    BaseEle: B = UiBase as B
) => {
    class HhmmssEleBase extends EleMixin(
        props,
        {} as BaseEmits,
        BaseEle as typeof UiBase
    ) {
        protected static _style = baseCss;
        protected static _template = baseHtml;

        get _staticEls() {
            return {
                ...super._staticEls,
                cols: this.$0`.cols`!,
                hCol: this.$0`.col.hour`!,
                mCol: this.$0`.col.minute`!,
                sCol: this.$0`.col.second`!,
                lists: this.$<NumListEle>`dt-num-list`!,
                hList: this.$0<NumListEle>`dt-num-list.hour`!,
                mList: this.$0<NumListEle>`dt-num-list.minute`!,
                sList: this.$0<NumListEle>`dt-num-list.second`!,
                msWrapper: this.$0`[part="ms-wrapper"]`!,
                msInput: this.$0<HTMLInputElement>`input#ms`!
            } as const;
        }

        public scrollToCurrentItem() {
            this._els.lists.forEach((e) => e.scrollToCurrent());
        }

        public connectedCallback(): boolean | void {
            if (!super.connectedCallback()) return;
            const { _els } = this;
            _els.lists.forEach(
                (e) => (e.formatter = (i) => (i < 10 ? '0' : '') + i)
            );

            this._renderCols();
            this._updateGranularity();
            this._updateColsValue();

            this._bindEvt(_els.lists)('select-num', this._onColsSelect);
            this._bindEvt(_els.msInput)('input', this._onMsInput);
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
            for (const c of this.colOrder as ColOrder) {
                _els[`${c}Col`].remove();
                _els.cols.appendChild(_els[`${c}Col`]);
            }
        });

        private _updateGranularity = super._genRenderFn(() => {
            const { _minmaxGran, _els } = this;
            const [maxG, minG] = granHelper.time.idx(
                _minmaxGran.max,
                _minmaxGran.min
            );
            const show = (el: HTMLElement, condition: boolean) =>
                !(el.style.display = condition ? '' : 'none');
            show(
                _els.cols,
                [
                    show(_els.hCol, maxG >= 3 && minG <= 3),
                    show(_els.mCol, maxG >= 2 && minG <= 2),
                    show(_els.sCol, maxG >= 1 && minG <= 1)
                ].some((v) => v)
            );
            show(_els.msWrapper, maxG >= 0 && minG <= 0);
        });

        private _updateColsValue = super._genRenderFn(() => {
            const { millisecond, _els } = this;

            // set column values
            const hour = Math.floor(millisecond / (60 * 60 * 1000));
            const minute = Math.floor(
                (millisecond % (60 * 60 * 1000)) / (60 * 1000)
            );
            const second = Math.floor((millisecond % (60 * 1000)) / 1000);
            const ms = millisecond % 1000;
            _els.hList.currentNum = hour;
            _els.mList.currentNum = minute;
            _els.sList.currentNum = second;
            _els.msInput.value = ('000' + ms).slice(-3);
        });

        private _getMsFromEle() {
            const { _els } = this;
            const hour = _els.hList.currentNum;
            const minute = _els.mList.currentNum;
            const second = _els.sList.currentNum;
            const ms = Math.min(Math.max(0, +_els.msInput.value || 0), 999);
            return ((hour * 60 + minute) * 60 + second) * 1000 + ms;
        }
        private _onMsInput = (e: Event) => {
            if (!(e.target instanceof HTMLInputElement)) return;
            let v = +e.target.value;
            if (Number.isNaN(v)) v = 0;
            v = Math.min(Math.max(0, Math.floor(v)), 999);
            e.target.value = ('000' + v).slice(-3);
            this.millisecond = this._getMsFromEle();
        };
        private _onColsSelect = (e: NumListEvent['select-num']) => {
            if (!(e.target instanceof NumListEle)) return;
            e.stopPropagation();
            e.target.currentNum = e.detail.newNum;
            this.millisecond = this._getMsFromEle();
        };
    }
    return HhmmssEleBase as unknown as MixinEle<
        B,
        typeof props,
        BaseEmits,
        {
            scrollToCurrentItem(): void;
            get _staticEls(): HhmmssEleBase['_staticEls'];
        }
    >;
};
