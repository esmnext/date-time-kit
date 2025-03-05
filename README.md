# date-time-kit

![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)
![npm version](https://img.shields.io/npm/v/your-library-name.svg)
![GitHub stars](https://img.shields.io/github/stars/your-username/your-repo.svg)

## 📌 简介

date-time-kit是一个功能强大且易于使用的 TypeScript 库，旨在解决 [web前端 时间区间选择] 的问题。它适用于 [所有web环境]，并提供高效、轻量级的解决方案。

## ✨ 特性

- 🚀 **特性 1** - js原生开发，不依赖任何第三方框架
- 🎯 **特性 2** - 非常小 仅需几十kb
- 📦 **特性 3** - 提供国际化，时区控制，精确到毫秒
- 🔥 适用于浏览器
- ✅ 易于集成，支持 TypeScript

## 📦 安装

使用 npm 安装：

```sh
npm install @gez/date-time-kit
```

使用 yarn 安装：

```sh
yarn add @gez/date-time-kit
```

## 🚀 快速开始

### 在 ES6 环境中使用

```ts
import { open } from 'date-time-kit';

const result = awiat open({
    root: document.getElementById('root')
});
console.log(result);
```

## 📖 API 文档

### `open(option)`

- `option` (**kitOption**): 初始化对象
    ```ts
     export interface kitOption {
            root: HTMLElement,
            // default select
            startTime?: timeString, 
            endTime?: timeString,
            // default limit
            maxTime?: timeString,
            minTime?: timeString,
            // default lang
            lang?: lang, // zhCN, enUS ...
            // default time zone
            timeZone?: number // -12 - 12
        }
    export type timeString = `${number}-${number}-${number} ${number}:${number}:${number}:${number}`;
    ```
- **返回值**: kitResult
    ```ts
        export interface kitResult {
            startTime: timeString,
            endTime: timeString,
            // time stamp
            startTimeStamp: number,
            endTimeStamp: number,
            timeZone: number
        }

    ```

示例：

```js
import dataTimeKit from 'date-time-kit';

const result = awiat dataTimeKit.open({
    root: document.getElementById('root')
});
console.log(result);
```

## 💡 示例代码

```js
const result = awiat dataTimeKit.open({
    root: document.getElementById('root'),
    maxTime: "1990-01-01 00:00:00:000",
    minTime: "2050-01-01 00:00:00:000",
    startTime: "1990-01-01 00:00:00:000",
    endTime: "2050-01-01 00:10:10:022",
    timeZone: 4
});
console.log(result);
```

## 🛠️ 贡献

欢迎贡献代码！请阅读 [贡献指南](CONTRIBUTING.md) 以了解如何提交 PR 或报告问题。

## 📄 许可证

本项目基于 [MIT 许可证](LICENSE) 进行发布。

## 📬 联系

如果你有任何问题或建议，请随时在 [GitHub Issues](https://github.com/dp-os/date-time-kit/issues) 提交反馈，或通过 email@example.com 联系我们。

---

⭐️ 如果你觉得这个项目有用，欢迎给个 Star 支持我们！

