import { css, dirLtr } from '../../utils';

export default css`
:host {
  --gap: var(--calendar-item-gap, 10px 0);
  --item-size: var(--calendar-item-size, 30px);
  --color-disabled-text: var(--calendar-item-disabled-text, #aaa);
  --color-active-bg: var(--calendar-item-active-bg, #002BE7);
  --color-active-text: var(--calendar-item-active-text, #fff);
  --color-in-range-bg: var(--calendar-item-in-range-bg, #002BE726);
  --color-in-range-text: var(--calendar-item-in-range-text, #002BE7);
  --color-hover-bg: var(--calendar-item-hover-bg, #0000000D);
  --color-hover-text: var(--calendar-item-hover-text, #000);
  --color-active-hover-bg: var(--calendar-item-active-hover-bg, var(--color-active-bg));
  --color-active-hover-text: var(--calendar-item-active-hover-text, var(--color-active-text));
}

.wrapper {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: var(--gap);
  width: 100%;
  height: 100%;
  justify-content: space-between;
  text-align: center;
}

.week {
  min-width: var(--item-size);
  display: inline-block;
}

.item {
  min-width: var(--item-size);
  line-height: var(--item-size);
  height: var(--item-size);
  position: relative;
  --half-period-bg-w: calc(50% + var(--item-size) / 2);
}
.item span {
  position: relative;
  z-index: 2;
}
.item:not(.disabled) {
  cursor: pointer;
}
:host([show-other-month]) .item.prev.disabled, :host([show-other-month]) .item.next.disabled, .item.disabled:not(.prev, .next) {
  cursor: not-allowed;
  color: var(--color-disabled-text);
}
.item:hover {
  color: var(--color-hover-text);
}
.item.in-range {
  color: var(--color-in-range-text);
}
.item:not(.disabled) .highlight {
  display: block;
  border-radius: 50%;
  position: absolute;
  top: 50%;
  left: 50%;
  width: var(--item-size);
  height: var(--item-size);
  transform: translate(-50%, -50%);
}
.item.start, .item.end {
  color: var(--color-active-text);
}
.item.start .highlight, .item.end .highlight {
  background-color: var(--color-active-bg);
}
.item:hover .highlight {
  background-color: var(--color-hover-bg);
}
.item.start:hover .highlight, .item.end:hover .highlight {
  background-color: var(--color-active-hover-bg);
}
.item.start:hover, .item.end:hover {
  color: var(--color-active-hover-text);
}
.item.in-range .bg {
  display: block;
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 43, 231, 0.1490196078);
}
.item:nth-of-type(7n + 1) .bg {
  border-radius: var(--item-size) 0 0 var(--item-size);
  width: var(--half-period-bg-w);
  left: calc(50% - var(--item-size) / 2);
}
.item:nth-of-type(7n) .bg {
  border-radius: 0 var(--item-size) var(--item-size) 0;
  width: var(--half-period-bg-w);
}
.item:nth-of-type(7n).range-start .bg {
  width: var(--item-size);
  left: calc(50% - var(--item-size) / 2);
}
.item.range-start .bg {
  border-top-left-radius: var(--item-size);
  border-bottom-left-radius: var(--item-size);
  width: var(--half-period-bg-w);
  left: calc(50% - var(--item-size) / 2);
}
.item.range-end .bg {
  border-top-right-radius: var(--item-size);
  border-bottom-right-radius: var(--item-size);
  width: var(--half-period-bg-w);
}
.item.range-start.range-end .bg {
  width: var(--item-size);
}
.item:nth-of-type(7n).range-start .bg, .item:nth-of-type(7n + 1).range-end .bg {
  width: var(--item-size);
}

${dirLtr(css`
.item .bg:dir(ltr) { border-radius: 0; }
.item.in-range .bg:dir(ltr) { left: auto; right: 0; }
.item:nth-of-type(7n + 1) .bg:dir(ltr) { left: auto; right: calc(50% - var(--item-size) / 2); border-radius: 0 var(--item-size) var(--item-size) 0; }
.item:nth-of-type(7n) .bg:dir(ltr) { border-radius: var(--item-size) 0 0 var(--item-size); }
.item:nth-of-type(7n).range-start .bg:dir(ltr) { left: auto; right: calc(50% - var(--item-size) / 2); }
.item.range-start .bg:dir(ltr) {
  border-top-right-radius: var(--item-size);
  border-bottom-right-radius: var(--item-size);
  left: auto;
  right: calc(50% - var(--item-size) / 2);
}
.item.range-end .bg:dir(ltr) {
  border-top-left-radius: var(--item-size);
  border-bottom-left-radius: var(--item-size);
}
`)}
`;
