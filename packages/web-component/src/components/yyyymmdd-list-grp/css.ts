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

export const selectorCss = css`${baseCss}
:host { display: inline-block; }
.list-grp {
  display: flex;
  flex-direction: column;
  overflow: hidden;
  gap: 15px;
}

dt-popover, dt-echo {
  width: 100%;
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
  cursor: pointer;
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
