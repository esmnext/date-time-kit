import { css } from '../../utils';

export const styleStr = css`
.wrapper {
  display: flex;
  flex-direction: column;
  gap: 15px;
  position: fixed;
}

.menu {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 10px 5px;
  font-size: 14px;
  gap: 10px;
  border-radius: 6px;
  border: 1px solid #eee;
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
  background-color: #fff;
  width: 285px;
}
.menu > * {
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

dt-yyyymm-nav::part(list-grp) {
  height: 254px;
  margin-top: 10px;
}
dt-calendar-base.hide {
  display: none;
}
`;
