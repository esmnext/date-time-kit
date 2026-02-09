import { type DateTimeGranularity, granHelper } from '../../utils';
import {
    type BaseAttrs,
    type BaseEmits,
    type Emit2EventMap,
    UiBase
} from '../web-component-base';
import { echoCss } from './css';
import { echoHtml } from './html';
import {
    type DateFormatterFn,
    type DatetimeFormatterFn,
    type TimeFormatterFn,
    defaultFormatter
} from './utils';

export const iconTypeList = ['date', 'time', 'datetime'] as const;
export type IconType = (typeof iconTypeList)[number];

export interface Attrs extends BaseAttrs {
    active?: boolean;
    'current-time'?: number | string | Date;
    'min-granularity'?: DateTimeGranularity;
    'max-granularity'?: DateTimeGranularity;
}

export interface Emits extends BaseEmits {}
export type EventMap = Emit2EventMap<Emits>;

export class Ele extends UiBase<Attrs, Emits> {
    public static readonly tagName = 'dt-echo' as const;
    protected static _style = echoCss;
    protected static _template = echoHtml;
    static get observedAttributes(): string[] {
        return [
            ...(super.observedAttributes as (keyof BaseAttrs)[]),
            'active',
            'current-time',
            'min-granularity',
            'max-granularity'
        ] satisfies (keyof Attrs)[];
    }

    public get active(): boolean {
        return this.hasAttribute('active');
    }
    public set active(v: boolean) {
        this.toggleAttribute('active', !!v);
    }
    public get currentTime(): Date {
        const v = this._getAttr('current-time', '' + Date.now());
        return new Date(Number.isNaN(+v) ? v : +v);
    }
    public set currentTime(val: number | string | Date) {
        const v = new Date(val);
        if (Number.isNaN(+v)) return;
        this.setAttribute('current-time', +v + '');
    }
    public get minGranularity() {
        return this._getAttr('min-granularity') as DateTimeGranularity;
    }
    public set minGranularity(v: DateTimeGranularity) {
        if (!granHelper.dateTime.has(v)) return;
        this.setAttribute('min-granularity', v);
    }
    public get maxGranularity() {
        return this._getAttr('max-granularity') as DateTimeGranularity;
    }
    public set maxGranularity(v: DateTimeGranularity) {
        if (!granHelper.dateTime.has(v)) return;
        this.setAttribute('max-granularity', v);
    }

    protected get _minmaxGran() {
        const [min, max] = granHelper.dateTime.minmax(
            this.minGranularity,
            this.maxGranularity
        );
        return { min, max };
    }

    public get iconType(): IconType {
        const { min, max } = this._minmaxGran;
        if (granHelper.isDateGran(max) && granHelper.isDateGran(min))
            return 'date';
        if (granHelper.isTimeGran(max) && granHelper.isTimeGran(min))
            return 'time';
        return 'datetime';
    }

    get _staticEls() {
        return {
            ...super._staticEls,
            icon: this.$0`.icon`!,
            text: this.$0<HTMLSpanElement>`.text`!
        } as const;
    }

    public connectedCallback(): boolean | void {
        if (!super.connectedCallback()) return;
        this._render();
        return true;
    }
    protected _onAttrChanged(
        name: string,
        oldValue: string | null,
        newValue: string | null
    ) {
        super._onAttrChanged(name, oldValue, newValue);
        this._render();
    }

    private _render = super._genRenderFn(() => {
        const { _els, iconType } = this;
        _els.icon.setAttribute('icon-type', iconType);
        _els.text.textContent = this._currentFormatter[iconType](
            this.currentTime,
            this._minmaxGran as any
        );
    });

    private _currentFormatter = {
        time: defaultFormatter.time,
        date: defaultFormatter.date,
        datetime: defaultFormatter.datetime
    };
    /** 时分秒毫秒回显格式化函数。设置为 `null` 则重置为默认值 */
    public get timeFormatter(): TimeFormatterFn {
        return this._currentFormatter.time;
    }
    public set timeFormatter(fn: TimeFormatterFn | null) {
        this._currentFormatter.time =
            typeof fn === 'function' ? fn : defaultFormatter.time;
        this._render();
    }

    /** 年月日回显格式化函数。设置为 `null` 则重置为默认值 */
    public get dateFormatter(): DateFormatterFn {
        return this._currentFormatter.date;
    }
    public set dateFormatter(fn: DateFormatterFn | null) {
        this._currentFormatter.date =
            typeof fn === 'function' ? fn : defaultFormatter.date;
        this._render();
    }

    /** 日期时间回显格式化函数。设置为 `null` 则重置为默认值 */
    public get dateTimeFormatter(): DatetimeFormatterFn {
        return this._currentFormatter.datetime;
    }
    public set dateTimeFormatter(fn: DatetimeFormatterFn | null) {
        this._currentFormatter.datetime =
            typeof fn === 'function' ? fn : defaultFormatter.datetime;
        this._render();
    }
}

Ele.define();
