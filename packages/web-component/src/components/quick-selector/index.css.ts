import { arrowRightSvg, svg2cssUrl } from '../../assets';
import { css } from '../../utils';

export default css`
:host {
  width: fit-content;
  display: block;
}

.menu {
  display: flex;
  flex-direction: column;
  align-items: center;
  font-size: 14px;
  gap: 10px;
  position: fixed;
}
.menu > * {
  width: 100%;
}

.radio-grp {
  display: flex;
  flex-direction: column;
  gap: 5px;
  width: 100%;
}
.radio-grp > label {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  padding: 5px;
}
.radio-grp > label:hover {
  background-color: #f5f5f5;
}
.radio-grp dt-i18n {
  flex: 1;
}
.radio-grp input {
  margin: 0;
  width: 24px;
  height: 24px;
  cursor: pointer;
}

.arrow-right-icon {
  display: inline-block;
  width: 15px;
  height: 15px;
  background: ${svg2cssUrl(arrowRightSvg)} no-repeat center center;
  cursor: pointer;
}

.dividing-line {
  display: block;
  height: 1px;
  width: 100%;
  background-color: #eee;
}

.tz-trigger {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 5px;
  gap: 10px;
  cursor: pointer;
  white-space: nowrap;
}
.tz-trigger:hover {
  background-color: #f5f5f5;
}
.tz-trigger bdo {
  direction: ltr;
}

.title {
  display: flex;
  align-items: center;
  padding: 5px;
  gap: 10px;
  font-weight: 700;
  font-size: 18px;
}
.title svg {
  border: 5px solid transparent;
  border-radius: 50%;
  margin: -5px;
  cursor: pointer;
  box-sizing: content-box;
}
.title svg:hover {
  background-color: #eee;
  border-color: #eee;
}

.menu.tz {
  min-width: 180px;
  max-height: 293px;
  overflow: hidden auto;
}
.menu.tz fieldset {
  width: 100%;
  border: none;
  border-top: 1px solid #eee;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 5px;
}
.menu.tz fieldset legend {
  padding: 0 5px;
  margin-bottom: 5px;
  font-size: 12px;
  line-height: 24px;
  color: #666;
}
.menu.tz label {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  padding: 5px;
}
.menu.tz label:hover {
  background-color: #f5f5f5;
}
.menu.tz input {
  margin: 0;
  width: 24px;
  height: 24px;
  cursor: pointer;
}

button {
  border: none;
  min-height: 40px;
  border-radius: 6px;
  padding: 5px 15px;
  font-size: 16px;
  line-height: 1;
  background-color: #18181B;
  color: #fff;
  font-weight: 500;
  cursor: pointer;
}

.menu.custom {
  padding: 14px;
  gap: 15px;
}
.menu.custom dt-period-selector {
  width: 590px;
}
.menu.custom .btns {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
.menu.custom #reset {
  background-color: #E5E7E8;
  color: #333;
}
`;
