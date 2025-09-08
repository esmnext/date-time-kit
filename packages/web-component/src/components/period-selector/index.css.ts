import { css } from '../../utils';

export default css`
:host {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.date-echo {
  display: flex;
  gap: 5px;
  align-items: center;
}

.start-date-echo-wrapper,
.end-date-echo-wrapper {
  width: 100%;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
  border-radius: 6px;
  border: 1px solid var(--dt-border-input, #00000026);
  padding: 4px;
}
.start-date-echo-wrapper.active,
.end-date-echo-wrapper.active {
  border-color: var(--dt-accent, #333);
}

.date-echo .label {
  font-size: 14px;
  line-height: 1;
}

.start-date-echo, .end-date-echo {
  font-size: 16px;
  line-height: 1;
  font-weight: bold;
}

.dividing-line {
  display: block;
  height: 1px;
  width: 20px;
  background-color: var(--dt-border-input, #eee);
}

dt-yyyymm-nav::part(list-grp) {
  height: 254px;
  margin-top: 15px;
}

dt-calendar-base.hide {
  display: none;
}

.calendars {
  display: flex;
  gap: 20px;
}

.wrapper {
  flex: 1;
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 15px;
}

dt-calendar-base {
  height: 254px;
}
dt-calendar-base::part(week) {
  font-size: 12px;
  line-height: 14px;
}
dt-calendar-base::part(item) {
  font-size: 14px;
}
`;
