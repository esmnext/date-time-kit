import { css } from '../../utils';

export default css`
:host {
  --color-current-bg: var(--calendar-item-in-range-bg, #002BE726);
  --color-current-text: var(--calendar-item-in-range-text, #002BE7);
  --color-hover-bg: var(--calendar-item-hover-bg, #0000000D);
  --color-hover-text: var(--calendar-item-hover-text, #000);
  --color-current-hover-bg: var(--calendar-item-in-range-hover-bg, var(--color-current-bg));
  --color-current-hover-text: var(--calendar-item-in-range-hover-text, var(--color-current-text));
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
}
.item.item-current {
  color: var(--color-current-text);
  background-color: var(--color-current-bg);
}
.item:hover {
  color: var(--color-hover-text);
  background-color: var(--color-hover-bg);
}
.item.item-current:hover {
  color: var(--color-current-hover-text);
  background-color: var(--color-current-hover-bg);
}
`;
