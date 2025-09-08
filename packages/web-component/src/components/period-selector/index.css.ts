import { svg2cssUrl, timeSvg } from '../../assets';
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
  border: 1px solid #00000026;
  padding: 4px;
}
.start-date-echo-wrapper.active,
.end-date-echo-wrapper.active {
  border-color: #333;
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
  background-color: #eee;
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

dt-popover {
  position: relative;
}

[open] .time-echo-wrapper {
  border-color: #18181B;
}

.time-echo-wrapper {
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

.time-selector {
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
.time-selector .title {
  font-size: 16px;
  margin: 0;
  line-height: 1;
}

dt-hhmmss-ms-list-grp::part(list-container) {
  gap: 2px;
}
dt-hhmmss-ms-list-grp::part(list) {
  scroll-behavior: smooth;
}
dt-hhmmss-ms-list-grp::part(item) {
  font-size: 14px;
  line-height: 17px;
}

#time-selector-done-btn {
  border: none;
  min-height: 30px;
  border-radius: 6px;
  padding: 5px 10px;
  font-size: 14px;
  background-color: #18181B;
  color: #fff;
}

.time-icon {
  display: inline-block;
  width: 20px;
  height: 20px;
  background: ${svg2cssUrl(timeSvg)} 50% / 20px 20px no-repeat;
}

.time-echo {
  font-size: 14px;
  color: #999;
  line-height: 1;
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
