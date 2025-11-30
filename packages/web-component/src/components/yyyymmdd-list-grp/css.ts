import { css } from '../../utils';

export const baseCss = css`
.cols {
  flex: 1;
  display: flex;
  flex-direction: row;
  height: 0;
  justify-content: space-between;
  gap: 2px;
}

.col {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.col > span {
  text-align: center;
  display: inline-block;
  line-height: 27px;
}

dt-num-list {
  flex: 1;
}
`;

export const listGrpCss = css`:host {
  display: flex;
  flex-direction: column;
  overflow: hidden;
  gap: 15px;
}${baseCss}`;

import { dateSvg, svg2cssUrl } from '../../assets';

export const selectorCss = css`${baseCss}
.list-grp {
  display: flex;
  flex-direction: column;
  overflow: hidden;
  gap: 15px;
}

dt-popover {
  width: 100%;
}
dt-popover::part(pop) {
  width: 100%;
}

.date-trigger {
  width: 100%;
  padding: 4px;
  display: flex;
  gap: 5px;
  border-radius: 4px;
  min-height: 30px;
  border: 1px solid var(--dt-border-input, #0001);
  align-items: center;
  cursor: pointer;
}

[open] .date-trigger {
  border-color: var(--dt-accent, #18181B);
}

.date-icon {
  display: inline-block;
  width: 20px;
  height: 20px;
  position: relative;
}
.date-icon::before {
  content: '';
  background-color: var(--dt-text-main, #333);
  display: block;
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  mask-repeat: no-repeat;
  mask-position: center;
  mask-size: contain;
  mask-image: ${svg2cssUrl(dateSvg)};
  -webkit-mask-repeat: no-repeat;
  -webkit-mask-position: center;
  -webkit-mask-size: contain;
  -webkit-mask-image: ${svg2cssUrl(dateSvg)};
}

.date-echo {
  font-size: 14px;
  color: var(--dt-text-secondary, #999);
  line-height: 1;
}

[slot="pop"] {
  width: 100%;
  height: 461px;

  display: flex;
  flex-direction: column;
  gap: 15px;
  padding: 15px;
}

h3 {
  font-size: 16px;
  margin: 0;
  line-height: 1;
}

button {
  border: none;
  min-height: 30px;
  border-radius: 6px;
  padding: 5px 10px;
  font-size: 14px;
  background-color: var(--dt-accent, #18181B);
  color: var(--dt-text-reverse, #fff);
}
button:hover {
  background-color: var(--color-accent-hover, #000);
}

dt-num-list {
  scroll-behavior: smooth;
}
dt-num-list::part(container) {
  gap: 2px;
}
dt-num-list::part(item) {
  font-size: 14px;
  line-height: 17px;
}
`;
