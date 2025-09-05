import { css } from '../../utils';

export default css`
:host {
  --color-current-bg: var(--calendar-item-in-range-bg, #002BE726);
  --color-current-text: var(--calendar-item-in-range-text, #002BE7);
  --color-hover-bg: var(--calendar-item-hover-bg, #0000000D);
  --color-hover-text: var(--calendar-item-hover-text, #000);
  display: block;
  overflow: hidden auto;
  position: relative !important;
  overflow-anchor: none;
}

.container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 5px;
}

.item {
  cursor: pointer;
  user-select: none;
  width: 100%;
  text-align: center;
  border-radius: 2px;
  padding: 5px 2px;
  box-sizing: border-box;
}
.item.item-current {
  color: var(--color-current-text);
  background-color: var(--color-current-bg);
}
.item:hover {
  color: var(--color-hover-text);
  background-color: var(--color-hover-bg);
}
`;
