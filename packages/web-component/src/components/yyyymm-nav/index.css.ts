import {
    arrowDownSvg,
    arrowLeftDoubleSvg,
    arrowLeftSvg,
    arrowRightDoubleSvg,
    arrowRightSvg,
    svg2cssUrl
} from '../../assets';
import { css } from '../../utils';

export default css`
.wrapper {
  display: block;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: space-between;
  overflow: hidden;
}
.wrapper.show-list .btns {
  display: none;
}

.btns {
  display: flex;
  align-items: center;
}

.btn {
  width: 25px;
  height: 25px;
  cursor: pointer;
  background: 50%/16px 16px no-repeat;
  --icon-arrow-left: ${svg2cssUrl(arrowLeftSvg)};
  --icon-arrow-left-double: ${svg2cssUrl(arrowLeftDoubleSvg)};
  --icon-arrow-right: ${svg2cssUrl(arrowRightSvg)};
  --icon-arrow-right-double: ${svg2cssUrl(arrowRightDoubleSvg)};
  background-image: var(--bg-img);
  border-radius: 50%;
}
.btn:hover {
  background-color: #eee;
}
:host(:not([show-ctrl-btn-year-add])) .btn.add.year, :host(:not([show-ctrl-btn-year-sub])) .btn.sub.year, :host(:not([show-ctrl-btn-month-add])) .btn.add.month, :host(:not([show-ctrl-btn-month-sub])) .btn.sub.month {
  display: none;
}
.btn.sub {
  --bg-img: var(--icon-arrow-left);
}
:host([show-ctrl-btn-month-add]) .btn.sub.add.year, :host([show-ctrl-btn-month-sub]) .btn.sub.sub.year {
  --bg-img: var(--icon-arrow-left-double);
}
.btn.add {
  --bg-img: var(--icon-arrow-right);
}
:host([show-ctrl-btn-month-add]) .btn.add.add.year, :host([show-ctrl-btn-month-sub]) .btn.add.sub.year {
  --bg-img: var(--icon-arrow-right-double);
}

dt-yyyymmdd-list-grp {
  width: 100%;
}
dt-yyyymmdd-list-grp::part(list) {
  scroll-behavior: smooth;
}
dt-yyyymmdd-list-grp::part(col label) {
  display: none;
}

dt-popover {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.title-wrapper {
  box-sizing: border-box;
  display: flex;
  align-items: center;
  gap: 2px;
  cursor: pointer;
  margin: 10px 0;
  min-height: 25px;
  padding: 0 10px;
  border-radius: 2px;
  user-select: none;
}
.title-wrapper:hover {
  background-color: #eee;
}

.title-arrow {
  display: inline-block;
  width: 16px;
  height: 16px;
  background: ${svg2cssUrl(arrowDownSvg)} no-repeat center center;
}

dt-popover[open] .title-arrow {
  transform: rotate(180deg);
}
`;
