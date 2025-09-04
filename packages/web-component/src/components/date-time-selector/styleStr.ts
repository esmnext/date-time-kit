import { css } from '../../utils';

export const styleStr = css`
.wrapper {
  display: flex;
  flex-direction: column;
  gap: 15px;
}
dt-popover {
  position: relative;
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
  position: absolute;
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
  background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='14' height='15' fill='currentColor'%3E%3Cpath d='M7.4335 4.241a.4376.4376 0 0 0-.871.0594v3.783l.0044.0622a.4375.4375 0 0 0 .1921.3029L8.9242 9.877l.0566.0317a.4376.4376 0 0 0 .5495-.1559l.0317-.0566a.4376.4376 0 0 0-.1559-.5495L7.4375 7.8471V4.3004l-.004-.0593ZM7 1.6667c-3.2217 0-5.8333 2.6116-5.8333 5.8333 0 3.2217 2.6116 5.8333 5.8333 5.8333 3.2217 0 5.8333-2.6116 5.8333-5.8333 0-3.2217-2.6116-5.8333-5.8333-5.8333Zm0 .814c2.7721 0 5.0194 2.2472 5.0194 5.0193 0 2.7721-2.2473 5.0194-5.0194 5.0194S1.9806 10.2721 1.9806 7.5 4.228 2.4806 7 2.4806Z'/%3E%3C/svg%3E") 50%/20px 20px no-repeat;
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
