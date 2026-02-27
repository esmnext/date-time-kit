import { granHelper } from '../../utils';
import {
    EleWithProps,
    UiBase,
    booleanAttr,
    minmaxGranAttr,
    timeAttr
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

const props = {
    active: booleanAttr('active'),
    currentTime: timeAttr('current-time'),
    ...minmaxGranAttr(
        ['minGranularity', 'min-granularity'],
        ['maxGranularity', 'max-granularity']
    )
};

export class Ele extends EleWithProps(props, UiBase) {
    public static readonly tagName = 'dt-echo' as const;
    protected static _style = echoCss;
    protected static _template = echoHtml;

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
