import type { Ele as PopoverEle, EventMap as PopoverEvent } from '../popover';
import {
    type BaseEmits,
    EleMixin,
    type Emit2EventMap,
    UiBase,
    booleanAttr,
    intAttr,
    minmaxGranAttr
} from '../web-component-base';
import {
    Ele as YyyyMmDdListGrpEle,
    type EventMap as YyyyMmDdListGrpEvent
} from '../yyyymmdd-list-grp';
import styleStr from './index.css';
import html from './index.html';

const granAttrs = minmaxGranAttr(
    ['minGranularity', 'min-granularity'],
    ['maxGranularity', 'max-granularity'],
    'ym'
);

export const props = {
    millisecond: intAttr('millisecond'),
    ...granAttrs,
    /** 选择器的粒度，表示最大可选的时间单位。默认为 year。 */
    maxGranularity: granAttrs.maxGranularity,
    /** 选择器的粒度，表示最小可选的时间单位。默认为 month。 */
    minGranularity: granAttrs.minGranularity,
    /**
     * 是否显示年份控制按钮（快速增减年份）
     * @default false
     */
    showCtrlBtnYearAdd: booleanAttr('show-ctrl-btn-year-add'),
    showCtrlBtnYearSub: booleanAttr('show-ctrl-btn-year-sub'),
    /**
     * 是否显示月份控制按钮（快速增减月份）
     * @default false
     */
    showCtrlBtnMonthAdd: booleanAttr('show-ctrl-btn-month-add'),
    showCtrlBtnMonthSub: booleanAttr('show-ctrl-btn-month-sub')
};

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
export class Ele extends EleMixin(props, {} as Emits, UiBase) {
    public static readonly tagName = 'dt-yyyymm-nav' as const;
    protected static _style = styleStr;
    protected static _template = html;

    public connectedCallback() {
        if (!super.connectedCallback()) return;
        this._render();
        this._bindEvt<PopoverEle>`.echo`('open-change', this._onTitleToggle);
        this._bindEvt<YyyyMmDdListGrpEle>`dt-yyyymmdd-list-grp`(
            'change',
            this._onItemSelect
        );
        this._bindEvt<HTMLElement>`.btn`('click', this._onBtnClick);
    }

    protected _onAttrChanged(
        name: string,
        oldValue: string | null,
        newValue: string | null
    ) {
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

    private _render = super._genRenderFn(() => {
        const ms = this.millisecond;
        this.$0<YyyyMmDdListGrpEle>`dt-yyyymmdd-list-grp`!.millisecond = ms;
        this.$0`.title`!.textContent = this.titleFormatter(ms);
    });

    private _onTitleToggle = (e: PopoverEvent['open-change']) => {
        const isOpen = e.detail;
        e.stopPropagation();
        this.$0`.wrapper`!.classList.toggle('show-list', isOpen);
        this
            .$0<YyyyMmDdListGrpEle>`dt-yyyymmdd-list-grp`!.scrollToCurrentItem();
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
        return `${(month < 10 ? '0' : '') + month}/${year}`;
    };
}

Ele.define();
