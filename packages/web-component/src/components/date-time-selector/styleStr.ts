import { css } from '../../utils';
import { GranType } from './common';

export const styleStr = css`
:host { font-size: 14px; }

.host-wrapper { display: contents; }

${[
    GranType.Calendar,
    GranType.DateTime,
    GranType.Time,
    GranType.Date,
    GranType.CalendarTime
]
    .map(
        (t) =>
            css`.host-wrapper[data-type='${t}'] :not([data-show~='${t}'], slot, slot *, dt-i18n, [slot]:not([data-show]))`
    )
    .join(',')} {
  display: none;
}

dt-popover { width: 100%; }
.wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 15px;
  width: 285px;
}
.wrapper > * { width: 100%; }

dt-calendar-base {
  /* 254 = item height 6 * 30 + week 14 + gap 10 * 6 */
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

.confirmBtn {
  border: none;
  min-height: 30px;
  border-radius: 6px;
  padding: 5px 10px;
  font-size: 14px;
  background-color: var(--dt-accent, #18181B);
  color: var(--dt-text-reverse, #fff);
  cursor: pointer;
}
.confirmBtn:hover {
  background-color: var(--color-accent-hover, #000);
}

.timeOnly::part(pop),
dt-yyyymmdd-selector::part(pop) {
  width: 285px;
}

@media (max-width: 750px) {
  .wrapper,
  .timeOnly::part(pop),
  dt-yyyymmdd-selector::part(pop) {
    width: 100%;
  }
}
`;
