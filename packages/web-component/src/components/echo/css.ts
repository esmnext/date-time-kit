import { css } from '../../utils';

import { dateSvg, svg2cssUrl, timeSvg } from '../../assets';

export const echoCss = css`
.wrapper {
  width: 100%;
  padding: 4px;
  display: flex;
  gap: 5px;
  border-radius: 4px;
  min-height: 30px;
  border: 1px solid var(--dt-border-input, #0001);
  align-items: center;
  cursor: pointer;
}
:host([active]) .wrapper {
  border-color: var(--dt-accent, #18181B);
}

[icon-type='date'],
[icon-type='datetime'] {
  --icon: ${svg2cssUrl(dateSvg)};
}
[icon-type='time'] {
  --icon: ${svg2cssUrl(timeSvg)};
}

.icon {
  display: inline-block;
  width: 20px;
  height: 20px;
  position: relative;
}
.icon::before {
  content: '';
  background-color: var(--dt-text-main, #333);
  display: block;
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  mask-repeat: no-repeat;
  mask-position: center;
  mask-size: contain;
  mask-image: var(--icon);
  -webkit-mask-repeat: no-repeat;
  -webkit-mask-position: center;
  -webkit-mask-size: contain;
  -webkit-mask-image: var(--icon);
}

.echo {
  font-size: 14px;
  color: var(--dt-text-secondary, #999);
  line-height: 1;
}
`;
