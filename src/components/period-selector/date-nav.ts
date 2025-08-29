import { debounce, html } from "@/utils";
import { BaseAttrs, DefEle, UiBase } from "@/components/web-component-base";
import styleStr from './date-nav.scss?inline';
import Popover, { PopoverEmit } from "../popover";
import YyyyMmDdListGrpEle from "../yyyymmdd-list-grp";

export interface DateNavAttrs extends BaseAttrs {
    'millisecond': number;
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
    'show-ctrl-btn-year'?: boolean;
    /**
     * 是否显示月份控制按钮（快速增减月份）
     * @default false
     */
    'show-ctrl-btn-month'?: boolean;
}

export interface DateNavEmit {
    'change': {
        oldStartTime: Date;
        oldEndTime: Date;
        newStartTime: Date;
        newEndTime: Date;
    };
};

/**
 * 日期导航组件
 *
 * 存在一个 titleFormatter 方法，可以重写该方法以自定义年月标题的回显格式。
 */
@DefEle('date-nav')
export default class DateNav extends UiBase<DateNavAttrs, DateNavEmit> {
    static get observedAttributes(): string[] {
        return [
            ...(super.observedAttributes as (keyof BaseAttrs)[]),
            'millisecond',
            'max-granularity',
            'min-granularity',
            'show-ctrl-btn-year',
            'show-ctrl-btn-month',
        ] satisfies (keyof DateNavAttrs)[];
    }

    protected _style = styleStr;
    protected _template = html`
<div class="btns sub">
    <i class="btn sub year"></i>
    <i class="btn sub month"></i>
</div>
<dt-popover class="echo">
    <div slot="trigger" class="title-wrapper">
        <span class="title">title</span>
        <i class="title-arrow"></i>
    </div>
    <dt-yyyymmdd-list-grp slot="pop" min-granularity="month"></dt-yyyymmdd-list-grp>
</dt-popover>
<div class="btns add">
    <i class="btn add month"></i>
    <i class="btn add year"></i>
</div>
`;

    public get millisecond() {
        return Math.floor(+this._getAttr('millisecond', '0'));
    }
    public set millisecond(v: number) {
        if (!Number.isSafeInteger(v)) return;
        this.setAttribute('millisecond', '' + Math.floor(v));
    }

    public get showCtrlBtnYear() {
        return this.hasAttribute('show-ctrl-btn-year');
    }
    public set showCtrlBtnYear(val: boolean) {
        this.toggleAttribute('show-ctrl-btn-year', val);
    }
    public get showCtrlBtnMonth() {
        return this.hasAttribute('show-ctrl-btn-month');
    }
    public set showCtrlBtnMonth(val: boolean) {
        this.toggleAttribute('show-ctrl-btn-month', val);
    }

    constructor() {
        super();
        this._applyTemplate();
    }

    public connectedCallback() {
        if (!super.connectedCallback()) return;
        this._render();
        this.shadowRoot!.querySelector<Popover>('.echo')!.addEventListener('open-change', this._onTitleToggle);
        this.shadowRoot!.querySelectorAll<HTMLElement>('.btn').forEach(btn => {
            btn.addEventListener('click', this._onBtnClick);
        });
    }
    public disconnectedCallback() {
        if (!super.disconnectedCallback()) return;
        this.shadowRoot!.querySelector<Popover>('.echo')!.removeEventListener('open-change', this._onTitleToggle);
        this.shadowRoot!.querySelectorAll<HTMLElement>('.btn').forEach(btn => {
            btn.removeEventListener('click', this._onBtnClick);
        });
    }

    protected _onAttrChanged(name: string, oldValue: string, newValue: string) {
        super._onAttrChanged(name, oldValue, newValue);
        this._render();
        if (name === 'millisecond') {
            this.dispatchEvent('change', {
                oldStartTime: new Date(+oldValue),
                oldEndTime: new Date(+oldValue),
                newStartTime: new Date(+newValue),
                newEndTime: new Date(+newValue),
            });
        }
    }

    private _render = debounce(() => {
        const root = this.shadowRoot!, ms = this.millisecond;
        root.querySelector<YyyyMmDdListGrpEle>('dt-yyyymmdd-list-grp')!.millisecond = ms;
        root.querySelector('.title')!.textContent = this.titleFormatter(ms);
    }, 0);

    private _onTitleToggle = ({ detail: isOpen }: CustomEvent<PopoverEmit['open-change']>) => {
        this.classList.toggle('show-list', isOpen);
    };

    private _onBtnClick = (e: MouseEvent) => {
        if (!(e.target instanceof HTMLElement)) return;
        const date = new Date(this.millisecond);
        date.setDate(1);
        if (e.target.matches('.add.year')) {
            date.setFullYear(date.getFullYear() + 1);
        }
        else if (e.target.matches('.sub.year')) {
            date.setFullYear(date.getFullYear() - 1);
        }
        else if (e.target.matches('.add.month')) {
            date.setMonth(date.getMonth() + 1);
        }
        else if (e.target.matches('.sub.month')) {
            date.setMonth(date.getMonth() - 1);
        }
        this.millisecond = +date;
    };

    public titleFormatter = (ms: number) => {
        const date = new Date(ms);
        const year = date.getFullYear();
        const month = date.getMonth() + 1;
        return `${('0' + month).slice(-2)}/${year}`;
    }
}
