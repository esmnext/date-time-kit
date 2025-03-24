# @gez/date-time-kit 

## v1.0.3-alpha.25 2025-03-24
- 新增 时区启用禁用选项 默认启用 enableZone?: boolean | undefined

## v1.0.3-alpha.18 2025-03-19
- 移除 自动转时区的功能

## v1.0.3-alpha.17 2025-03-17
- 修复 getTimeStringByTimeZone方法 时区偏移计算错误

## v1.0.3-alpha.16 2025-03-14
- 修改 取消遮罩颜色
- 新增 option 参数 granularity 控制 选择颗粒度
-
## v1.0.3-alpha.13 2025-03-13
- 修复 返回值 时间字符串 缺少0填充
- 新增 支持 默认主题色
- 新增 导出 export declare function getTimeStringByTimestamp(timestamp: number): timeString;
- 修改 默认 层级 100 -> 3000
- 新增 导出 export declare function getTimeStringByTimeZone(timeString: timeString, timeZone: number, currentTimeZone?: number): timeString;

## v1.0.3-alpha.5 2025-03-12
- 修改 type 类型
- 修复 结束时间毫秒变更时 修改到了开始时间
- 修改 getTimestampByLimitKey 方法新增时区 参数
- 修改 getLimitKeyByTimetamp 方法新增 时区 参数
- 新增 时区的支持


## v1.0.3-alpha.1 2025-03-11
- 新增 导出 export declare function getLimitKeyByTimetamp(startTimestamp: timeString, endTimestamp: timeString): kitDataLimit | null;
- 新增 导出 export declare function getTimestampByLimitKey(limit: kitDataLimit): { startTime: timeString, endTime: timeString };
- 新增 default 导出
- 新增 open 方法 ts定义
- 新增 禁用 超过时间范围的 日期选择
- 新增 返回值 quick 字段
- 修复 返回值毫秒字段不符合标准规范问题 