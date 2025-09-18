import { arrowRightSvg, svg2cssUrl } from '../../assets';
import { css } from '../../utils';

export default css`
:host {
  width: fit-content;
  display: block;
}
dt-popover {
  width: 100%;
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
  background-color: var(--dt-bg-hover, #f5f5f5);
}
.radio-grp dt-i18n {
  flex: 1;
}
.radio {
  display: inline-block;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  border: 1px solid var(--dt-accent, #18181B);
  padding: 4px;
}
input[type='radio']:checked + .radio {
  background: var(--dt-accent, #18181B) content-box;
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
  background-color: var(--dt-border-dark, #eee);
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
  background-color: var(--dt-bg-hover, #f5f5f5);
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
  background-clip: padding-box;
}
.title svg:hover {
  background-color: var(--dt-bg-hover, #eee);
  border-color: var(--dt-bg-hover, #eee);
}

.menu.tz {
  min-width: 180px;
  max-height: 293px;
  overflow: hidden auto;
}
.menu.tz fieldset {
  width: 100%;
  border: none;
  border-top: 1px solid var(--dt-border-dark, #eee);
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
  color: var(--dt-text-auxiliary, #666);
}
.menu.tz label {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  padding: 5px;
}
.menu.tz label:hover {
  background-color: var(--dt-bg-hover, #f5f5f5);
}

button {
  border: none;
  min-height: 40px;
  border-radius: 6px;
  padding: 5px 15px;
  font-size: 16px;
  line-height: 1;
  background-color: var(--dt-accent, #18181B);
  font-weight: 500;
  cursor: pointer;
}
button:hover {
  background-color: var(--color-accent-hover, #000);
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
button#done {
  color: var(--dt-text-reverse, #fff);
}
.menu.custom #reset {
  background-color: var(--dt-bg-secondary, #E5E7E8);
  color: inherit;
}
.menu.custom #reset:hover {
  background-color: var(--dt-bg-secondary-hover, #D6D8DB);
}
`;
