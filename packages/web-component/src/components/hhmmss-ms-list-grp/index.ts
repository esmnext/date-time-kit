import { css, debounce, html } from '../../utils';
import { Ele as NumListEle, type EventMap as NumListEvent } from '../num-list';
import {
    type BaseAttrs,
    type Emit2EventMap,
    UiBase
} from '../web-component-base';
NumListEle.define();
// import styleStr from './index.scss?inline';
const styleStr = css`
:host {
  display: flex;
  flex-direction: column;
  overflow: hidden;
  gap: 15px;
}

.cols {
  flex: 1;
  display: flex;
  flex-direction: row;
  height: 0;
  justify-content: space-between;
  gap: 2px;
}

.col {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.col > span {
  text-align: center;
  display: inline-block;
  line-height: 27px;
}

dt-num-list {
  flex: 1;
}

.ms-input {
  width: 100%;
  box-sizing: border-box;
  border: 1px solid rgba(0, 0, 0, 0.2);
  border-radius: 6px;
  padding: 4px;
  cursor: text;
}

label > span {
  display: inline-block;
  line-height: 1;
  font-size: 14px;
  margin-bottom: 2px;
}

input {
  width: 100%;
  box-sizing: border-box;
  padding: 0;
  border: none;
  outline: none;
}

input::placeholder {
  color: #999;
}
`;

export interface Attrs extends BaseAttrs {
    millisecond: number;
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

export interface Emits {
    change: {
        oldMs: number;
        newMs: number;
    };
}
export type EventMap = Emit2EventMap<Emits>;

/**
 * 时分秒毫秒选择器
 */
export class Ele extends UiBase<Attrs, Emits> {
    public static readonly tagName = 'dt-hhmmss-ms-list-grp' as const;

    static get observedAttributes(): string[] {
        return [
            ...(super.observedAttributes as (keyof BaseAttrs)[]),
            'millisecond',
            'max-granularity',
            'min-granularity',
            'col-order'
        ] satisfies (keyof Attrs)[];
    }

    protected _style = styleStr;
    protected _template = html`
        <div class="cols" part="cols">
            <div class="col hour" part="col hour">
                <span>Hour</span>
                <dt-num-list
                    exportparts="container:list-container, item, item-current"
                    part="list hour"
                    class="hour"
                    min-num="0"
                    max-num="23"
                ></dt-num-list>
            </div>
            <div class="col minute" part="col minute">
                <span>Minute</span>
                <dt-num-list
                    exportparts="container:list-container, item, item-current"
                    part="list minute"
                    class="minute"
                    min-num="0"
                    max-num="59"
                ></dt-num-list>
            </div>
            <div class="col second" part="col second">
                <span>Second</span>
                <dt-num-list
                    exportparts="container:list-container, item, item-current"
                    part="list second"
                    class="second"
                    min-num="0"
                    max-num="59"
                ></dt-num-list>
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

    private get _listEleHour() {
        return this.shadowRoot?.querySelector('dt-num-list.hour') as NumListEle;
    }
    private get _listEleMinute() {
        return this.shadowRoot?.querySelector(
            'dt-num-list.minute'
        ) as NumListEle;
    }
    private get _listEleSecond() {
        return this.shadowRoot?.querySelector(
            'dt-num-list.second'
        ) as NumListEle;
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
        return this._getAttr('max-granularity', 'hour');
    }
    public set maxGranularity(v: 'hour' | 'minute' | 'second' | 'millisecond') {
        if (!['hour', 'minute', 'second', 'millisecond'].includes(v)) return;
        this.setAttribute('max-granularity', v);
    }
    public get minGranularity() {
        return this._getAttr('min-granularity', 'millisecond');
    }
    public set minGranularity(v: 'hour' | 'minute' | 'second' | 'millisecond') {
        if (!['hour', 'minute', 'second', 'millisecond'].includes(v)) return;
        this.setAttribute('min-granularity', v);
    }
    public get colOrder() {
        return this._getAttr('col-order', 'smh');
    }
    public set colOrder(v: 'hms' | 'hsm' | 'mhs' | 'msh' | 'shm' | 'smh') {
        if (!['hms', 'hsm', 'mhs', 'msh', 'shm', 'smh'].includes(v)) return;
        this.setAttribute('col-order', v);
    }

    public scrollToCurrentItem() {
        this.shadowRoot?.querySelectorAll('dt-num-list').forEach((ele) => {
            if (ele instanceof NumListEle) ele.scrollToCurrent();
        });
    }

    public connectedCallback() {
        if (!super.connectedCallback()) return;
        this._listEleHour.formatter =
            this._listEleMinute.formatter =
            this._listEleSecond.formatter =
                (num) => ('0' + num).slice(-2);

        this._renderCols();
        this._updateGranularity();
        this._updateColsValue();

        this._listEleHour.addEventListener('select-num', this._onColsSelect);
        this._listEleMinute.addEventListener('select-num', this._onColsSelect);
        this._listEleSecond.addEventListener('select-num', this._onColsSelect);
        this._msInputEle.addEventListener('input', this._onMsInput);
    }
    public disconnectedCallback() {
        if (!super.disconnectedCallback()) return;
        this._listEleHour.removeEventListener('select-num', this._onColsSelect);
        this._listEleMinute.removeEventListener(
            'select-num',
            this._onColsSelect
        );
        this._listEleSecond.removeEventListener(
            'select-num',
            this._onColsSelect
        );
        this._msInputEle.removeEventListener('input', this._onMsInput);
    }

    protected _onAttrChanged(name: string, oldValue: string, newValue: string) {
        super._onAttrChanged(name, oldValue, newValue);
        if (name === 'col-order') this._renderCols();
        else if (name === 'max-granularity' || name === 'min-granularity')
            this._updateGranularity();
        else if (name === 'millisecond') this._updateColsValue();
    }

    private _renderCols = debounce(() => {
        if (!this.isConnected) return;
        const {
            colOrder,
            _listEleHour: hEle,
            _listEleMinute: mEle,
            _listEleSecond: sEle
        } = this;
        // columns order
        const orderedCols: HTMLElement[] = [];
        for (const c of colOrder) {
            if (c === 'h') orderedCols.push(hEle);
            else if (c === 'm') orderedCols.push(mEle);
            else if (c === 's') orderedCols.push(sEle);
        }
        const colsContainer =
            this.shadowRoot!.querySelector<HTMLElement>('.cols')!;
        // return if order not changed
        if (!orderedCols.every((el, i) => el === colsContainer.children[i]))
            return;
        colsContainer.innerHTML = '';
        colsContainer.append(...orderedCols);
    }, 0);

    private _updateGranularity = debounce(() => {
        if (!this.isConnected) return;
        const { maxGranularity, minGranularity } = this;
        const hEle = this.shadowRoot!.querySelector<HTMLElement>('.col.hour')!;
        const mEle =
            this.shadowRoot!.querySelector<HTMLElement>('.col.minute')!;
        const sEle =
            this.shadowRoot!.querySelector<HTMLElement>('.col.second')!;
        const msEle = this.shadowRoot!.querySelector<HTMLElement>(
            '[part="ms-wrapper"]'
        )!;
        const colsContainer =
            this.shadowRoot!.querySelector<HTMLElement>('.cols')!;

        // granularity
        const granularityMap = {
            hour: 3,
            minute: 2,
            second: 1,
            millisecond: 0
        };
        let maxG = granularityMap[maxGranularity] ?? 0;
        let minG = granularityMap[minGranularity] ?? 3;
        if (maxG < minG) [maxG, minG] = [minG, maxG];
        hEle.style.display = maxG >= 3 && minG <= 3 ? '' : 'none';
        mEle.style.display = maxG >= 2 && minG <= 2 ? '' : 'none';
        sEle.style.display = maxG >= 1 && minG <= 1 ? '' : 'none';
        colsContainer.style.display = [hEle, mEle, sEle].filter(
            (ele) => ele.style.display !== 'none'
        ).length
            ? ''
            : 'none';
        msEle.style.display = maxG >= 0 && minG <= 0 ? '' : 'none';
    }, 0);

    private _updateColsValue = debounce(() => {
        if (!this.isConnected) return;
        const {
            _listEleHour: hEle,
            _listEleMinute: mEle,
            _listEleSecond: sEle,
            millisecond
        } = this;

        // set column values
        const hour = Math.floor(millisecond / (60 * 60 * 1000));
        const minute = Math.floor(
            (millisecond % (60 * 60 * 1000)) / (60 * 1000)
        );
        const second = Math.floor((millisecond % (60 * 1000)) / 1000);
        const ms = millisecond % 1000;
        hEle.currentNum = hour;
        mEle.currentNum = minute;
        sEle.currentNum = second;
        this._msInputEle.value = ('000' + ms).slice(-3);
    }, 0);

    private _getMsFromEle() {
        const hour = this._listEleHour.currentNum;
        const minute = this._listEleMinute.currentNum;
        const second = this._listEleSecond.currentNum;
        const ms = Math.min(Math.max(0, +this._msInputEle.value || 0), 999);
        return ((hour * 60 + minute) * 60 + second) * 1000 + ms;
    }
    private _onMsInput = (e: Event) => {
        if (!(e.target instanceof HTMLInputElement)) return;
        let v = +e.target.value;
        if (Number.isNaN(v)) v = 0;
        v = Math.min(Math.max(0, Math.floor(v)), 999);
        e.target.value = ('000' + v).slice(-3);
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
