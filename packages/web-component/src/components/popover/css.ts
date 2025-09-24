import { closeBarSvg, svg2cssUrl } from '../../assets';
import { css } from '../../utils';

export const styleStr = css`
::slotted([slot='pop']:not(.not-pop-bg)) {
  background-color: var(--dt-bg-block-light, #fff);
  padding: 10px 5px;
  border-radius: 6px;
  border: 1px solid var(--dt-border-dark, #0000001A);
  box-shadow: var(--dt-pop-box-shadow, 0 6px 16px #0003);
}
:host(:not([open])) slot[name='pop'] { display: none; }
:host([open]:not([strategy='none'])) slot[name='pop'] { display: block; }

:host(:not([strategy='none'])) slot[name='pop'] {
  position: fixed;
  z-index: var(--dt-pop-z-index, 9999);
  top: 0;
  left: 0;
}
:host([strategy='absolute']) slot[name='pop'] { position: absolute; }
:host([strategy='absolute']) { position: relative; }

@media (max-width: 750px) {
  :host([open]) slot[name='pop'] {
    width: 100%;
    top: unset;
    left: 0;
    bottom: 0;
    position: fixed;
  }
  :host([open]) slot[name='pop']::after, :host([open]) slot[name='pop']::before {
    content: '';
    display: block;
    position: absolute;
  }
  :host([open]) slot[name='pop']::before {
    bottom: 100%;
    left: 0;
    right: 0;
    height: 24px;
    border-radius: 20px 20px 0 0;
    background: var(--dt-bg-block-light, #fff);
  }
  :host([open]) slot[name='pop']::after {
    bottom: calc(100% + (24px - 4px) / 2);
    left: 50%;
    transform: translateX(-50%);
    width: 40px;
    height: 4px;
    background: var(--dt-border-dark, #0000001A);
    mask-image: ${svg2cssUrl(closeBarSvg)};
    -webkit-mask-image: ${svg2cssUrl(closeBarSvg)};
    cursor: pointer;
  }
  ::slotted([slot='pop']:not(.not-pop-bg)) {
    background-color: var(--dt-bg-block-light, #fff);
    padding: 15px;
    border-radius: 0;
    border: none;
    box-shadow: none;
  }
  /* for masking */
  :host([open])::before {
    content: '';
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: #0008;
    z-index: var(--dt-pop-z-index, 9999);
  }
}
`;
