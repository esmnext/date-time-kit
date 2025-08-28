import { html } from "@/utils";
import { BaseAttrs, CustomEleEventListener, DefEle, UiBase } from "@/components/web-component-base";
// import styleStr from './index.scss?inline';

export interface PeriodSelectorAttrs extends BaseAttrs {
    /**
     * The start time of the calendar display range.
     * @type {`string | number`} A value that can be passed to the Date constructor.
     * @default 'current-time'
     */
    'time-start': string | number;
    /**
     * The end time of the calendar display range.
     * @type {`string | number`} A value that can be passed to the Date constructor.
     * @default 'time-start'
     */
    'time-end': string | number;
    /**
     * 选择器的粒度，表示最小可选的时间单位。默认为 millisecond。
     * 例如设置为 'minute'，则表示只能选择到分钟，秒和毫秒将被忽略。
     */
    'min-granularity'?: 'day' | 'hour' | 'minute' | 'second' | 'millisecond';
}

export type PeriodSelectorEmit = (eventName: 'change', detail: {
    oldStartTime: Date;
    oldEndTime: Date;
    newStartTime: Date;
    newEndTime: Date;
}) => void;

export type PeriodSelectorEventListener<K extends Parameters<PeriodSelectorEmit>[0]> = CustomEleEventListener<PeriodSelector, K>;

/**
 * 时间段选择器（两个日历）
 */
@DefEle('period-selector')
export default class PeriodSelector extends UiBase<PeriodSelectorAttrs, PeriodSelectorEmit> {
    static get observedAttributes(): string[] {
        return [
            ...(super.observedAttributes as (keyof BaseAttrs)[]),
        ] satisfies (keyof PeriodSelectorAttrs)[];
    }

    // protected _style = styleStr;
    protected _template = html``;

    constructor() {
        super();
        this._applyTemplate();
    }

    public connectedCallback() {
        if (!super.connectedCallback()) return;
    }
    public disconnectedCallback() {
        if (!super.disconnectedCallback()) return;
    }

    protected _onAttrChanged(name: string, oldValue: string, newValue: string) {
        super._onAttrChanged(name, oldValue, newValue);
    }
}
