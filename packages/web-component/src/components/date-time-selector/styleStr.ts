import { css } from '../../utils';

export const styleStr = css`
:host {
  font-size: 14px;
}
dt-popover {
  width: 100%;
}
.wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 15px;
  width: 285px;
}
.wrapper > * {
  width: 100%;
}

dt-calendar-base {
  // 254 = item height 6 * 30 + week 14 + gap 10 * 6
  height: 254px;
}
dt-calendar-base::part(week) {
  font-size: 12px;
  line-height: 14px;
}
dt-calendar-base::part(item) {
  font-size: 14px;
}
dt-calendar-base.hide {
  display: none;
}

dt-yyyymm-nav::part(list-grp) {
  height: 254px;
  margin-top: 15px;
}

.onlyTime::part(pop) {
  width: 285px;
}

@media (max-width: 750px) {
  .wrapper,
  .onlyTime::part(pop) {
    width: 100%;
  }
}
`;
