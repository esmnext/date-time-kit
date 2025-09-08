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

.ms-input {
  width: 100%;
  border: 1px solid #0003;
  border-radius: 6px;
  padding: 4px;
  cursor: text;
}

label > span {
  display: inline-block;
  line-height: 1;
  font-size: 14px;
  margin-bottom: 2px;
}

input {
  width: 100%;
  padding: 0;
  border: none;
  outline: none;
}

input::placeholder {
  color: #999;
}
`;

export const listGrpCss =
    baseCss +
    css`
:host {
  display: flex;
  flex-direction: column;
  overflow: hidden;
  gap: 15px;
}
`;

import { svg2cssUrl, timeSvg } from '../../assets';

export const selectorCss =
    baseCss +
    css`
.list-grp {
  display: flex;
  flex-direction: column;
  overflow: hidden;
  gap: 15px;
}

dt-popover {
  position: relative;
  width: 100%;
}

[slot="trigger"] {
  width: 100%;
  padding: 4px;
  display: flex;
  gap: 5px;
  border-radius: 4px;
  min-height: 30px;
  border: 1px solid #0001;
  align-items: center;
  cursor: pointer;
}

[open] > [slot="trigger"] {
  border-color: #18181B;
}

.time-icon {
  display: inline-block;
  width: 20px;
  height: 20px;
  background: ${svg2cssUrl(timeSvg)} 50%/20px 20px no-repeat;
}

.time-echo {
  font-size: 14px;
  color: #999;
  line-height: 1;
}

[slot="pop"] {
  position: absolute;
  width: 100%;
  height: 461px;
  background-color: #fff;

  display: flex;
  flex-direction: column;
  gap: 15px;
  padding: 15px;
  border-radius: 6px;
  border: 1px solid #eee;
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
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
  background-color: #18181B;
  color: #fff;
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
