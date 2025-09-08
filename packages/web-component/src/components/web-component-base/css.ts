import { css } from '../../utils';

export const styleStr = css`
:host {
  display: inline-block;
}
* {
  box-sizing: border-box;
}
.bidirectional-flip:is(:lang(ae),:lang(ar),:lang(arc),:lang(bcc),:lang(bqi),:lang(ckb),:lang(dv),:lang(fa),:lang(glk),:lang(he),:lang(ku),:lang(mzn),:lang(nqo),:lang(pnb),:lang(ps),:lang(sd),:lang(ug),:lang(ur),:lang(yi)) {
  transform: scaleX(-1);
}
/* firefox only: */
@-moz-document url-prefix() {
  :host, * {
    scrollbar-width: thin;
    scrollbar-color: var(--scrollbar-thumb-color, #4444) transparent;
  }
  :host:hover, *:hover {
    scrollbar-color: var(--scrollbar-thumb-color-hover, var(--scrollbar-thumb-color, #8888)) transparent;
  }
}
`;

export const scrollbarStyleStr = css`
[dt]::-webkit-scrollbar, :host *::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}
[dt]::-webkit-scrollbar-button, :host *::-webkit-scrollbar-button {
  display: none;
}
[dt]::-webkit-scrollbar-corner, :host *::-webkit-scrollbar-corner {
  display: none;
}
[dt]::-webkit-scrollbar-thumb, :host *::-webkit-scrollbar-thumb {
  background-color: var(--scrollbar-thumb-color, #4444);
  border-radius: 4px;
  cursor: grab;
}
[dt]::-webkit-scrollbar-thumb:hover, :host *::-webkit-scrollbar-thumb:hover {
  background-color: var(--scrollbar-thumb-color-hover, var(--scrollbar-thumb-color, #8888));
}
[dt]::-webkit-scrollbar-thumb:active, :host *::-webkit-scrollbar-thumb:active {
  background-color: var(--scrollbar-thumb-color-active, var(--scrollbar-thumb-color, #2222));
  cursor: grabbing;
}
[dt]::-webkit-scrollbar-track, :host *::-webkit-scrollbar-track {
  background: transparent;
}
`;
