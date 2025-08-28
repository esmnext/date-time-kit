import { debounce, html } from "@/utils";
import { BaseAttrs, CustomEleEventListener, DefEle, UiBase } from "@/components/web-component-base";
import NumListEle, { NumListEventListener } from "../num-list";
import styleStr from './index.scss?inline';

export interface HhMmSsMsListGrpAttrs extends BaseAttrs {
    'millisecond': number;
    // 'max-millisecond'?: number;
    // 'min-millisecond'?: number;
    /**
     * 选择器的粒度，表示最大可选的时间单位。默认为 hour。
     * 例如设置为 'minute'，则表示最大只能选择到分钟，小时将被忽略。
     */
    'max-granularity'?: 'hour' | 'minute' | 'second' | 'millisecond';
    /**
     * 选择器的粒度，表示最小可选的时间单位。默认为 millisecond。
     * 例如设置为 'minute'，则表示只能选择到分钟，秒和毫秒将被忽略。
     */
    'min-granularity'?: 'hour' | 'minute' | 'second' | 'millisecond';
    'col-order'?: 'hms' | 'hsm' | 'mhs' | 'msh' | 'shm' | 'smh';
}

export type HhMmSsMsListGrpEmit = (eventName: 'change', detail: {
    oldMs: number;
    newMs: number;
}) => void;

export type HhMmSsMsListGrpEventListener<K extends Parameters<HhMmSsMsListGrpEmit>[0]> = CustomEleEventListener<HhMmSsMsListGrp, K>;

/**
 * 时分秒毫秒选择器
 */
@DefEle('hhmmss-ms-list-grp')
export default class HhMmSsMsListGrp extends UiBase<HhMmSsMsListGrpAttrs, HhMmSsMsListGrpEmit> {
    static get observedAttributes(): string[] {
        return [
            ...(super.observedAttributes as (keyof BaseAttrs)[]),
            'millisecond',
            'max-granularity',
            'min-granularity',
            'col-order',
        ] satisfies (keyof HhMmSsMsListGrpAttrs)[];
    }

    protected _style = styleStr;
    protected _template = html`
        <div class="cols" part="cols">
            <div class="col" part="col hour">
                <span>Hour</span>
                <dt-num-list part="list hour" class="hour" min-num="0" max-num="23"></dt-num-list>
            </div>
            <div class="col" part="col minute">
                <span>Minute</span>
                <dt-num-list part="list minute" class="minute" min-num="0" max-num="59"></dt-num-list>
            </div>
            <div class="col" part="col second">
                <span>Second</span>
                <dt-num-list part="list second" class="second" min-num="0" max-num="59"></dt-num-list>
            </div>
        </div>
        <label class="ms-input" part="ms-wrapper">
            <span part="ms-label">Millisecond</span>
            <input part="ms-input" id="ms" type="number" class="millisecond" min="0" max="999" step="1" placeholder="000" />
        </label>
    `;

    constructor() {
        super();
        this._applyTemplate();
    }

    private get _colsHourEle() {
        return this.shadowRoot?.querySelector('.cols .hour') as NumListEle;
    }
    private get _colsMinuteEle() {
        return this.shadowRoot?.querySelector('.cols .minute') as NumListEle;
    }
    private get _colsSecondEle() {
        return this.shadowRoot?.querySelector('.cols .second') as NumListEle;
    }
    private get _msInputEle() {
        return this.shadowRoot?.querySelector('input#ms') as HTMLInputElement;
    }

    public get millisecond() {
        const v = Math.floor(+this._getAttr('millisecond', '0'));
        return Math.min(Math.max(0, v), 24 * 60 * 60 * 1000 - 1);
    }
    public set millisecond(v: number) {
        v = Math.min(Math.max(0, Math.floor(v)), 24 * 60 * 60 * 1000 - 1);
        this.setAttribute('millisecond', '' + v);
    }
    public get maxGranularity() {
        return this._getAttr('max-granularity', 'hour') as 'hour' | 'minute' | 'second' | 'millisecond';
    }
    public set maxGranularity(v: 'hour' | 'minute' | 'second' | 'millisecond') {
        if (!['hour', 'minute', 'second', 'millisecond'].includes(v)) return;
        this.setAttribute('max-granularity', v);
    }
    public get minGranularity() {
        return this._getAttr('min-granularity', 'millisecond') as 'hour' | 'minute' | 'second' | 'millisecond';
    }
    public set minGranularity(v: 'hour' | 'minute' | 'second' | 'millisecond') {
        if (!['hour', 'minute', 'second', 'millisecond'].includes(v)) return;
        this.setAttribute('min-granularity', v);
    }
    public get colOrder() {
        return this._getAttr('col-order', 'smh') as 'hms' | 'hsm' | 'mhs' | 'msh' | 'shm' | 'smh';
    }
    public set colOrder(v: 'hms' | 'hsm' | 'mhs' | 'msh' | 'shm' | 'smh') {
        if (!['hms', 'hsm', 'mhs', 'msh', 'shm', 'smh'].includes(v)) return;
        this.setAttribute('col-order', v);
    }

    public connectedCallback() {
        if (!super.connectedCallback()) return;
        this._colsHourEle.formatter =
            this._colsMinuteEle.formatter =
            this._colsSecondEle.formatter = (num) => ('0' + num).slice(-2);

        this._renderCols();
        this._updateGranularity();
        this._updateColsValue();

        this._colsHourEle.addEventListener('select-num', this._onColsSelect);
        this._colsMinuteEle.addEventListener('select-num', this._onColsSelect);
        this._colsSecondEle.addEventListener('select-num', this._onColsSelect);
        this._msInputEle.addEventListener('input', this._onMsInput);
    }
    public disconnectedCallback() {
        if (!super.disconnectedCallback()) return;
        this._colsHourEle.removeEventListener('select-num', this._onColsSelect);
        this._colsMinuteEle.removeEventListener('select-num', this._onColsSelect);
        this._colsSecondEle.removeEventListener('select-num', this._onColsSelect);
        this._msInputEle.removeEventListener('input', this._onMsInput);
    }

    protected _onAttrChanged(name: string, oldValue: string, newValue: string) {
        super._onAttrChanged(name, oldValue, newValue);
        if (name === 'col-order') this._renderCols();
        else if (name === 'max-granularity' || name === 'min-granularity') this._updateGranularity();
        else if (name === 'millisecond') this._updateColsValue();
    }

    private _renderCols = debounce(() => {
        if (!this.isConnected) return;
        const {
            colOrder,
            _colsHourEle: hEle, _colsMinuteEle: mEle, _colsSecondEle: sEle
        } = this;
        // columns order
        const orderedCols = [];
        for (const c of colOrder) {
            if (c === 'h') orderedCols.push(hEle);
            else if (c === 'm') orderedCols.push(mEle);
            else if (c === 's') orderedCols.push(sEle);
        }
        const colsContainer = this.shadowRoot!.querySelector<HTMLElement>('.cols')!;
        // return if order not changed
        if (!orderedCols.every((el, i) => el === colsContainer.children[i])) return;
        colsContainer.innerHTML = '';
        colsContainer.append(...orderedCols);
    }, 0);

    private _updateGranularity = debounce(() => {
        if (!this.isConnected) return;
        const {
            _colsHourEle: hEle, _colsMinuteEle: mEle, _colsSecondEle: sEle,
            maxGranularity, minGranularity
        } = this;
        const colsContainer = this.shadowRoot!.querySelector<HTMLElement>('.cols')!;

        // granularity
        const granularityMap = { hour: 3, minute: 2, second: 1, millisecond: 0 };
        let maxG = granularityMap[maxGranularity] ?? 0;
        let minG = granularityMap[minGranularity] ?? 3;
        if (maxG < minG) [maxG, minG] = [minG, maxG];
        hEle.style.display = (maxG >= 3 && minG <= 3) ? '' : 'none';
        mEle.style.display = (maxG >= 2 && minG <= 2) ? '' : 'none';
        sEle.style.display = (maxG >= 1 && minG <= 1) ? '' : 'none';
        colsContainer.style.display =
            [hEle, mEle, sEle].filter(ele => ele.style.display !== 'none').length ? '' : 'none';
        this.shadowRoot!.querySelector<HTMLElement>('[part="ms-wrapper"]')!.style.display =
            (maxG >= 0 && minG <= 0) ? '' : 'none';
    }, 0);

    private _updateColsValue = debounce(() => {
        if (!this.isConnected) return;
        const {
            _colsHourEle: hEle, _colsMinuteEle: mEle, _colsSecondEle: sEle,
            millisecond
        } = this;

        // set column values
        const hour = Math.floor(millisecond / (60 * 60 * 1000));
        const minute = Math.floor((millisecond % (60 * 60 * 1000)) / (60 * 1000));
        const second = Math.floor((millisecond % (60 * 1000)) / 1000);
        const ms = millisecond % 1000;
        hEle.currentNum = hour;
        mEle.currentNum = minute;
        sEle.currentNum = second;
        this._msInputEle.value = ('000' + ms).slice(-3);
    }, 0);

    private _getMsFromEle() {
        const hour = this._colsHourEle.currentNum;
        const minute = this._colsMinuteEle.currentNum;
        const second = this._colsSecondEle.currentNum;
        const ms = Math.min(Math.max(0, +this._msInputEle.value || 0), 999);
        return ((hour * 60 + minute) * 60 + second) * 1000 + ms;
    }
    private _onMsInput = (e: Event) => {
        if (!(e.target instanceof HTMLInputElement)) return;
        let v = +e.target.value;
        if (isNaN(v)) v = 0;
        v = Math.min(Math.max(0, Math.floor(v)), 999);
        e.target.value = ('000' + v).slice(-3);
        const oldMs = this.millisecond;
        const newMs = this._getMsFromEle();
        this.millisecond = newMs;
        this.dispatchEvent('change', {
            oldMs,
            newMs: this.millisecond
        }, true);
    };

    private _onColsSelect: NumListEventListener<'select-num'> =
        ({ target, detail: { newNum } }) => {
            console.log('cols select', target, newNum);
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
