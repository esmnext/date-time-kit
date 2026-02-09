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
  border: 1px solid var(--dt-border-input, #0003);
  border-radius: 6px;
  padding: 4px;
  cursor: text;
}
.ms-input input {
  background-color: transparent;
  color: inherit;
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
  color: var(--dt-text-secondary, #999);
}
`;

export const listGrpCss = css`${baseCss}
:host {
  display: flex;
  flex-direction: column;
  overflow: hidden;
  gap: 15px;
}
`;

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

dt-echo {
  width: 100%;
}

[slot="pop"] {
  width: 100%;
  max-height: 461px;

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
