import { debounce } from '../../utils';
import type { Ele as PopoverEle, EventMap as PopoverEvent } from '../popover';
import {
    type BaseAttrs,
    type BaseEmits,
    type Emit2EventMap,
    UiBase
} from '../web-component-base';
import {
    Ele as YyyyMmDdListGrpEle,
    type EventMap as YyyyMmDdListGrpEvent
} from '../yyyymmdd-list-grp';
import styleStr from './index.css';
import html from './index.html';

export interface Attrs extends BaseAttrs {
    millisecond: number;
    /**
     * 选择器的粒度，表示最大可选的时间单位。默认为 year。
     */
    'max-granularity'?: 'year' | 'month';
    /**
     * 选择器的粒度，表示最小可选的时间单位。默认为 month。
     */
    'min-granularity'?: 'year' | 'month';
    /**
     * 是否显示年份控制按钮（快速增减年份）
     * @default false
     */
    'show-ctrl-btn-year-add'?: boolean;
    'show-ctrl-btn-year-sub'?: boolean;
    /**
     * 是否显示月份控制按钮（快速增减月份）
     * @default false
     */
    'show-ctrl-btn-month-add'?: boolean;
    'show-ctrl-btn-month-sub'?: boolean;
}

export interface Emits extends BaseEmits {
    change: {
        oldTime: Date;
        newTime: Date;
    };
    'popover-open-change': boolean;
}
export type EventMap = Emit2EventMap<Emits>;

/**
 * 日期导航组件
 *
 * 存在一个 titleFormatter 方法，可以重写该方法以自定义年月标题的回显格式。
 */
export class Ele extends UiBase<Attrs, Emits> {
    public static readonly tagName = 'dt-yyyymm-nav' as const;

    static get observedAttributes(): string[] {
        return [
            ...(super.observedAttributes as (keyof BaseAttrs)[]),
            'millisecond',
            'max-granularity',
            'min-granularity',
            'show-ctrl-btn-month-add',
            'show-ctrl-btn-year-sub',
            'show-ctrl-btn-month-add',
            'show-ctrl-btn-month-sub'
        ] satisfies (keyof Attrs)[];
    }

    protected _style = styleStr;
    protected _template = html;

    public get millisecond() {
        return Math.floor(+this._getAttr('millisecond', '0'));
    }
    public set millisecond(v: number) {
        if (!Number.isSafeInteger(v)) return;
        this.setAttribute('millisecond', '' + Math.floor(v));
    }

    public get showCtrlBtnYearAdd() {
        return this.hasAttribute('show-ctrl-btn-year-add');
    }
    public set showCtrlBtnYearAdd(val: boolean) {
        this.toggleAttribute('show-ctrl-btn-year-add', val);
    }
    public get showCtrlBtnYearSub() {
        return this.hasAttribute('show-ctrl-btn-year-sub');
    }
    public set showCtrlBtnYearSub(val: boolean) {
        this.toggleAttribute('show-ctrl-btn-year-sub', val);
    }
    public get showCtrlBtnMonthAdd() {
        return this.hasAttribute('show-ctrl-btn-month-add');
    }
    public set showCtrlBtnMonthAdd(val: boolean) {
        this.toggleAttribute('show-ctrl-btn-month-add', val);
    }
    public get showCtrlBtnMonthSub() {
        return this.hasAttribute('show-ctrl-btn-month-sub');
    }
    public set showCtrlBtnMonthSub(val: boolean) {
        this.toggleAttribute('show-ctrl-btn-month-sub', val);
    }

    constructor() {
        super();
        this._applyTemplate();
    }

    public connectedCallback() {
        if (!super.connectedCallback()) return;
        this._render();
        this.shadowRoot!.querySelector<PopoverEle>('.echo')!.addEventListener(
            'open-change',
            this._onTitleToggle
        );
        this.shadowRoot!.querySelector<YyyyMmDdListGrpEle>(
            'dt-yyyymmdd-list-grp'
        )!.addEventListener('change', this._onItemSelect);
        this.shadowRoot!.querySelectorAll<HTMLElement>('.btn').forEach(
            (btn) => {
                btn.addEventListener('click', this._onBtnClick);
            }
        );
    }
    public disconnectedCallback() {
        if (!super.disconnectedCallback()) return;
        this.shadowRoot!.querySelector<PopoverEle>(
            '.echo'
        )!.removeEventListener('open-change', this._onTitleToggle);
        this.shadowRoot!.querySelector<YyyyMmDdListGrpEle>(
            'dt-yyyymmdd-list-grp'
        )!.removeEventListener('change', this._onItemSelect);
        this.shadowRoot!.querySelectorAll<HTMLElement>('.btn').forEach(
            (btn) => {
                btn.removeEventListener('click', this._onBtnClick);
            }
        );
    }

    protected _onAttrChanged(name: string, oldValue: string | null, newValue: string | null) {
        super._onAttrChanged(name, oldValue, newValue);
        this._render();
        if (name === 'millisecond') {
            this.dispatchEvent(
                'change',
                {
                    oldTime: new Date(Math.floor(+oldValue!)),
                    newTime: new Date(Math.floor(+newValue!))
                },
                true
            );
        }
    }

    private _render = debounce(() => {
        const root = this.shadowRoot!;
        const ms = this.millisecond;
        root.querySelector<YyyyMmDdListGrpEle>(
            'dt-yyyymmdd-list-grp'
        )!.millisecond = ms;
        root.querySelector('.title')!.textContent = this.titleFormatter(ms);
    }, 0);

    private _onTitleToggle = (e: PopoverEvent['open-change']) => {
        const isOpen = e.detail;
        e.stopPropagation();
        this.shadowRoot!.querySelector('.wrapper')!.classList.toggle(
            'show-list',
            isOpen
        );
        this.shadowRoot!.querySelector<YyyyMmDdListGrpEle>(
            'dt-yyyymmdd-list-grp'
        )!.scrollToCurrentItem();
        this.dispatchEvent('popover-open-change', isOpen, true);
    };
    private _onItemSelect = (e: YyyyMmDdListGrpEvent['change']) => {
        if (!(e.target instanceof YyyyMmDdListGrpEle)) return;
        e.stopPropagation();
        this.millisecond = e.target.millisecond;
    };
    private _onBtnClick = (e: MouseEvent) => {
        if (!(e.target instanceof HTMLElement)) return;
        const date = new Date(this.millisecond);
        date.setDate(1);
        if (e.target.matches('.add.year')) {
            date.setFullYear(date.getFullYear() + 1);
        } else if (e.target.matches('.sub.year')) {
            date.setFullYear(date.getFullYear() - 1);
        } else if (e.target.matches('.add.month')) {
            date.setMonth(date.getMonth() + 1);
        } else if (e.target.matches('.sub.month')) {
            date.setMonth(date.getMonth() - 1);
        }
        this.millisecond = +date;
    };

    public titleFormatter = (ms: number) => {
        const date = new Date(ms);
        const year = date.getFullYear();
        const month = date.getMonth() + 1;
        return `${('0' + month).slice(-2)}/${year}`;
    };
}

Ele.define();
