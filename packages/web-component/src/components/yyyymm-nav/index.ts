import { css, debounce, html } from '../../utils';
import {
    type BaseAttrs,
    type Emit2EventMap,
    UiBase
} from '../web-component-base';
// import styleStr from './index.scss?inline';
const styleStr = css`
.wrapper {
  display: block;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: space-between;
  overflow: hidden;
}
.wrapper.show-list .btns {
  display: none;
}

.btns {
  display: flex;
  align-items: center;
}

.btn {
  width: 25px;
  height: 25px;
  cursor: pointer;
  background: 50%/16px 16px no-repeat;
  --icon-arrow-left: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='17' fill='currentColor'%3E%3Cpath d='M11.687 1.703a.5.5 0 0 0-.707 0L4.852 7.83a.505.505 0 0 0-.045.05.5.5 0 0 0-.051.752l6.128 6.128a.5.5 0 0 0 .707-.707L5.817 8.28l5.87-5.87a.5.5 0 0 0 0-.707Z'/%3E%3C/svg%3E");
  --icon-arrow-left-double: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='17' fill='currentColor'%3E%3Cpath d='M9.037 1.98a.5.5 0 1 1 .707.707l-5.87 5.87 5.774 5.774a.5.5 0 1 1-.707.707L2.813 8.911a.5.5 0 0 1 .051-.752.505.505 0 0 1 .045-.051L9.037 1.98ZM13.037 1.98a.5.5 0 0 1 .707.707l-5.87 5.87 5.774 5.774a.5.5 0 1 1-.707.707L6.813 8.911a.5.5 0 0 1 .051-.752.505.505 0 0 1 .045-.051l6.128-6.128Z'/%3E%3C/svg%3E");
  --icon-arrow-right: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='17' height='17' fill='currentColor'%3E%3Cpath d='M5.256 1.703a.5.5 0 0 1 .707 0l6.128 6.128a.493.493 0 0 1 .045.05.5.5 0 0 1 .051.752l-6.128 6.128a.5.5 0 0 1-.707-.707l5.774-5.774-5.87-5.87a.5.5 0 0 1 0-.707Z'/%3E%3C/svg%3E");
  --icon-arrow-right-double: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='17' height='17' fill='currentColor'%3E%3Cpath d='M7.963 1.703a.5.5 0 0 0-.707.707l5.87 5.87-5.774 5.774a.5.5 0 0 0 .707.707l6.128-6.128a.5.5 0 0 0-.051-.751.493.493 0 0 0-.045-.051L7.963 1.703ZM3.963 1.703a.5.5 0 0 0-.707.707l5.87 5.87-5.774 5.774a.5.5 0 0 0 .707.707l6.128-6.128a.5.5 0 0 0-.051-.751.493.493 0 0 0-.045-.051L3.963 1.703Z'/%3E%3C/svg%3E");
  background-image: var(--bg-img);
  border-radius: 50%;
}
.btn:hover {
  background-color: #eee;
}
:host(:not([show-ctrl-btn-year-add])) .btn.add.year, :host(:not([show-ctrl-btn-year-sub])) .btn.sub.year, :host(:not([show-ctrl-btn-month-add])) .btn.add.month, :host(:not([show-ctrl-btn-month-sub])) .btn.sub.month {
  display: none;
}
.btn.sub {
  --bg-img: var(--icon-arrow-left);
}
:host([show-ctrl-btn-month-add]) .btn.sub.add.year, :host([show-ctrl-btn-month-sub]) .btn.sub.sub.year {
  --bg-img: var(--icon-arrow-left-double);
}
.btn.add {
  --bg-img: var(--icon-arrow-right);
}
:host([show-ctrl-btn-month-add]) .btn.add.add.year, :host([show-ctrl-btn-month-sub]) .btn.add.sub.year {
  --bg-img: var(--icon-arrow-right-double);
}

dt-yyyymmdd-list-grp {
  width: 100%;
}
dt-yyyymmdd-list-grp::part(list) {
  scroll-behavior: smooth;
}
dt-yyyymmdd-list-grp::part(col label) {
  display: none;
}

dt-popover {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.title-wrapper {
  box-sizing: border-box;
  display: flex;
  align-items: center;
  gap: 2px;
  cursor: pointer;
  margin: 10px 0;
  min-height: 25px;
  padding: 0 10px;
  border-radius: 2px;
  user-select: none;
}
.title-wrapper:hover {
  background-color: #eee;
}

.title-arrow {
  display: inline-block;
  width: 16px;
  height: 16px;
  background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='15' height='15' fill='currentColor'%3E%3Cpath d='m8.02 10.54 3.96-4.4a.583.583 0 0 0-.433-.973h-7.88a.583.583 0 0 0-.434.973l3.94 4.378c.216.24.585.26.824.044l.022-.021Z'/%3E%3C/svg%3E") no-repeat center center;
}

dt-popover[open] .title-arrow {
  transform: rotate(180deg);
}
`;
import { Ele as PopoverEle, type EventMap as PopoverEvent } from '../popover';
PopoverEle.define();
import {
    Ele as YyyyMmDdListGrpEle,
    type EventMap as YyyyMmDdListGrpEvent
} from '../yyyymmdd-list-grp';
YyyyMmDdListGrpEle.define();

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

export interface Emits {
    change: {
        oldStartTime: Date;
        oldEndTime: Date;
        newStartTime: Date;
        newEndTime: Date;
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
    protected _template = html`
<div class="wrapper">
    <div class="btns sub">
        <i class="btn sub year"></i>
        <i class="btn sub month"></i>
    </div>
    <dt-popover class="echo">
        <div slot="trigger" class="title-wrapper">
            <span class="title">title</span>
            <i class="title-arrow"></i>
        </div>
        <dt-yyyymmdd-list-grp slot="pop" min-granularity="month" part="list-grp"></dt-yyyymmdd-list-grp>
    </dt-popover>
    <div class="btns add">
        <i class="btn add month"></i>
        <i class="btn add year"></i>
    </div>
</div>
`;

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

    protected _onAttrChanged(name: string, oldValue: string, newValue: string) {
        super._onAttrChanged(name, oldValue, newValue);
        this._render();
        if (name === 'millisecond') {
            this.dispatchEvent(
                'change',
                {
                    oldStartTime: new Date(+oldValue),
                    oldEndTime: new Date(+oldValue),
                    newStartTime: new Date(+newValue),
                    newEndTime: new Date(+newValue)
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

    private _onTitleToggle = ({
        detail: isOpen
    }: PopoverEvent['open-change']) => {
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
