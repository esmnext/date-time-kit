/**
 * 字符串类型的别名，防止和其他字面量类型联合时被过度简化。
 * 例如：避免 `'utf-8' | string` 被化简成 `string`
 */
export type Str = string & Record<never, never>;

abstract class Granularity<T extends string = string> {
    public abstract readonly list: readonly T[];
    public abstract readonly map: Readonly<Map<T, number>>;
    public readonly has = (v: string): v is T => this.map.has(v as any);
    public readonly idx = ((...v: T[]) =>
        v.length === 1
            ? this.map.get(v[0])!
            : v.map((g) => this.map.get(g)!)) as {
        (v: T): number;
        (...v: T[]): number[];
    };
    private readonly _fromIdx = (idx: number): T => {
        if (idx < 0 || idx >= this.list.length)
            throw new Error(
                `${this.constructor.name}.getByIdx: index out of range: ${idx}`
            );
        return this.list[idx];
    };
    public readonly fromIdx = ((...idx: number[]) =>
        idx.length === 1
            ? this._fromIdx(idx[0])
            : idx.map((i) => this._fromIdx(i))) as {
        (idx: number): T;
        (...indexes: number[]): T[];
    };

    public readonly cp = (a: T, b: T): number => this.idx(a) - this.idx(b);
    public readonly lt = (a: T, b: T): boolean => this.cp(a, b) < 0;
    public readonly lte = (a: T, b: T): boolean => this.cp(a, b) <= 0;
    public readonly gt = (a: T, b: T): boolean => this.cp(a, b) > 0;
    public readonly gte = (a: T, b: T): boolean => this.cp(a, b) >= 0;

    public readonly minmax = (v1: T, v2: T): [T, T] =>
        this.lt(v1, v2) ? [v1, v2] : [v2, v1];
    public readonly minmaxIdx = (v1: T, v2: T) =>
        this.idx(...this.minmax(v1, v2)) as [number, number];

    public readonly min = (...args: T[]): T => {
        if (args.length === 0)
            throw new Error(
                `${this.constructor.name}.min needs at least one argument`
            );
        return args.reduce((prev, curr) =>
            this.cp(prev, curr) <= 0 ? prev : curr
        );
    };
    public readonly max = (...args: T[]): T => {
        if (args.length === 0)
            throw new Error(
                `${this.constructor.name}.max needs at least one argument`
            );
        return args.reduce((prev, curr) =>
            this.cp(prev, curr) >= 0 ? prev : curr
        );
    };

    public readonly clamp = (
        min: T,
        val: T | Str,
        max: T,
        rule: 'min' | 'max' = 'min'
    ): T => {
        [min, max] = this.minmax(min, max);
        if (!this.has(val)) return rule === 'min' ? min : max;
        return this.min(this.max(min, val), max);
    };
}

class _YMGranularity extends Granularity<'year' | 'month'> {
    public readonly year = 'year';
    public readonly month = 'month';
    public readonly list = [this.month, this.year] as const;
    public readonly map = new Map(this.list.map((v, idx) => [v, idx]));
}
type YMGran = _YMGranularity['list'][number];
export const ymGranHelper = new _YMGranularity();

class _DateGranularity extends Granularity<'year' | 'month' | 'day'> {
    public readonly year = ymGranHelper.year;
    public readonly month = ymGranHelper.month;
    public readonly day = 'day';
    public readonly list = [this.day, ...ymGranHelper.list] as const;
    public readonly map = new Map(this.list.map((v, idx) => [v, idx]));
}
type DateGran = _DateGranularity['list'][number];
export const dateGranHelper = new _DateGranularity();

class _TimeGranularity extends Granularity<
    'hour' | 'minute' | 'second' | 'millisecond'
> {
    public readonly hour = 'hour';
    public readonly minute = 'minute';
    public readonly second = 'second';
    public readonly millisecond = 'millisecond';
    public readonly list = [
        this.millisecond,
        this.second,
        this.minute,
        this.hour
    ] as const;
    public readonly map = new Map(this.list.map((v, idx) => [v, idx]));
}
type TimeGran = _TimeGranularity['list'][number];
export const timeGranHelper = new _TimeGranularity();

class _DateTimeGranularity extends Granularity<DateGran | TimeGran> {
    public readonly year = dateGranHelper.year;
    public readonly month = dateGranHelper.month;
    public readonly day = dateGranHelper.day;
    public readonly hour = timeGranHelper.hour;
    public readonly minute = timeGranHelper.minute;
    public readonly second = timeGranHelper.second;
    public readonly millisecond = timeGranHelper.millisecond;
    public readonly list = [
        ...timeGranHelper.list,
        ...dateGranHelper.list
    ] as const;
    public readonly map = new Map(this.list.map((v, idx) => [v, idx]));
    public readonly toTimeGran = (gran: DateGran | TimeGran): TimeGran =>
        this.clamp(this.hour, gran, this.millisecond) as TimeGran;
    public readonly toDateGran = (gran: DateGran | TimeGran): DateGran =>
        this.clamp(this.year, gran, this.day) as DateGran;
    public readonly isTimeGran = (
        gran: DateGran | TimeGran | Str
    ): gran is TimeGran => timeGranHelper.has(gran);
    public readonly isDateGran = (
        gran: DateGran | TimeGran | Str
    ): gran is DateGran => dateGranHelper.has(gran);
}
type DateTimeGran = _DateTimeGranularity['list'][number];
export const dateTimeGranHelper = new _DateTimeGranularity();

export const granHelper = {
    date: dateGranHelper,
    time: timeGranHelper,
    dateTime: dateTimeGranHelper,
    ym: ymGranHelper,
    toDateGran: dateTimeGranHelper.toDateGran,
    toTimeGran: dateTimeGranHelper.toTimeGran,
    isTimeGran: dateTimeGranHelper.isTimeGran,
    isDateGran: dateTimeGranHelper.isDateGran,
    isYMGran: (gran: string): gran is YMGran => ymGranHelper.has(gran),
    minmax: dateTimeGranHelper.minmax
} as const;

export type {
    DateGran as DateGranularity,
    TimeGran as TimeGranularity,
    DateTimeGran as DateTimeGranularity,
    YMGran as YMGranularity,
    Granularity as AbstractGranularity
};
