import { svg2cssUrl, timeSvg } from '../../assets';
import { css } from '../../utils';

export const styleStr = css`
:host {
  display: inline-block;
}

.wrapper {
  display: flex;
  flex-direction: column;
  gap: 15px;
  position: fixed;
}

[open] > .time-echo-wrapper {
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
  box-sizing: border-box;
  align-items: center;
  cursor: pointer;
}

.time-selector {
  position: fixed;
  width: 100%;
  height: 461px;
  box-sizing: border-box;
  background-color: #fff;

  display: flex;
  flex-direction: column;
  gap: 15px;
  padding: 15px;
  border-radius: 6px;
  border: 1px solid #eee;
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);

  .title {
    font-size: 16px;
    margin: 0;
    line-height: 1;
  }
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
  background: ${svg2cssUrl(timeSvg)} 50%/20px 20px no-repeat;
}

.time-echo {
  font-size: 14px;
  color: #999;
  line-height: 1;
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

  & > * {
    width: 100%;
    box-sizing: border-box;
  }
}

dt-calendar-base {
  // 254 = item height 6 * 30 + week 14 + gap 10 * 6
  height: 254px;

  &::part(week) {
    font-size: 12px;
    line-height: 14px;
  }

  &::part(item) {
    font-size: 14px;
  }
}
dt-yyyymm-nav::part(list-grp) {
  height: 254px;
  margin-top: 10px;
}
dt-calendar-base.hide {
  display: none;
}
`;
