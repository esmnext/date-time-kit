import { closeBarSvg, svg2cssUrl } from '../../assets';
import { css } from '../../utils';

/** 触发器容器的样式（dt-popover） */
export const styleStr = css`
:host { display: inline-block; }
`;

/** 气泡元素的独立样式（dt-popover-pop，挂载到 body） */
export const popStyleStr = css`
:host {
  display: block;
  position: fixed;
  z-index: var(--dt-pop-z-index, 9999);
  top: 0;
  left: 0;
}
:host([hidden]) {
  display: none;
}
::slotted(*) {
  background-color: var(--dt-bg-block-light, #fff);
  padding: 10px 5px;
  border-radius: var(--dt-pop-border-radius, 6px);
  border: 1px solid var(--dt-border-dark, #0000001A);
  box-shadow: var(--dt-pop-box-shadow, 0 6px 16px #0003);
}

@media (max-width: 750px) {
  :host([open]) {
    width: 100vw;
    max-height: min(90vh, 600px);
    top: unset;
    left: 0;
    bottom: 0;
  }
  :host([open])::after, :host([open])::before {
    content: '';
    display: block;
    position: absolute;
  }
  :host([open])::before {
    bottom: 100%;
    left: 0;
    right: 0;
    height: 24px;
    border-radius: 20px 20px 0 0;
    background: var(--dt-bg-block-light, #fff);
  }
  :host([open])::after {
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
  ::slotted(*) {
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
