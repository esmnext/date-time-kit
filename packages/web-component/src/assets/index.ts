const symbols = /[\r\n%#()<>?[\\\]^`{|}]/g;
export const svg2url = (svg: string) =>
    'data:image/svg+xml,' +
    svg
        .replace(
            '<svg',
            ~svg.indexOf('xmlns')
                ? '<svg'
                : '<svg xmlns="http://www.w3.org/2000/svg"'
        )
        .replace(/"/g, "'")
        .replace(/>\s{1,}</g, `><`)
        .replace(/\s{2,}/g, ` `)
        .replace(symbols, encodeURIComponent);
export const svg2cssUrl = (svg: string) => `url("${svg2url(svg)}")`;

export const arrowLeftSvg = `<svg class="bidirectional-flip" width="16" height="17" fill="currentColor"><path d="M11.687 1.703a.5.5 0 0 0-.707 0L4.852 7.83a.505.505 0 0 0-.045.05.5.5 0 0 0-.051.752l6.128 6.128a.5.5 0 0 0 .707-.707L5.817 8.28l5.87-5.87a.5.5 0 0 0 0-.707Z"/></svg>`;
export const arrowRightSvg = `<svg class="bidirectional-flip" width="17" height="17" fill="currentColor"><path d="M5.256 1.703a.5.5 0 0 1 .707 0l6.128 6.128a.493.493 0 0 1 .045.05.5.5 0 0 1 .051.752l-6.128 6.128a.5.5 0 0 1-.707-.707l5.774-5.774-5.87-5.87a.5.5 0 0 1 0-.707Z"/></svg>`;
export const arrowLeftDoubleSvg = `<svg class="bidirectional-flip" width="16" height="17" fill="currentColor"><path d="M9.037 1.98a.5.5 0 1 1 .707.707l-5.87 5.87 5.774 5.774a.5.5 0 1 1-.707.707L2.813 8.911a.5.5 0 0 1 .051-.752.505.505 0 0 1 .045-.051L9.037 1.98ZM13.037 1.98a.5.5 0 0 1 .707.707l-5.87 5.87 5.774 5.774a.5.5 0 1 1-.707.707L6.813 8.911a.5.5 0 0 1 .051-.752.505.505 0 0 1 .045-.051l6.128-6.128Z"/></svg>`;
export const arrowRightDoubleSvg = `<svg class="bidirectional-flip" width="17" height="17" fill="currentColor"><path d="M7.963 1.703a.5.5 0 0 0-.707.707l5.87 5.87-5.774 5.774a.5.5 0 0 0 .707.707l6.128-6.128a.5.5 0 0 0-.051-.751.493.493 0 0 0-.045-.051L7.963 1.703ZM3.963 1.703a.5.5 0 0 0-.707.707l5.87 5.87-5.774 5.774a.5.5 0 0 0 .707.707l6.128-6.128a.5.5 0 0 0-.051-.751.493.493 0 0 0-.045-.051L3.963 1.703Z"/></svg>`;
export const arrowDownSvg = `<svg class="bidirectional-flip" width="15" height="15" fill="currentColor"><path d="m8.02 10.54 3.96-4.4a.583.583 0 0 0-.433-.973h-7.88a.583.583 0 0 0-.434.973l3.94 4.378c.216.24.585.26.824.044l.022-.021Z"/></svg>`;
export const backArrowSvg = `<svg class="bidirectional-flip" width="24" height="24" fill="currentColor"><path d="M9.894 5.106a.75.75 0 0 1 0 1.06L4.811 11.25 21 11.25a.75.75 0 0 1 0 1.5l-16.191-.001 5.085 5.085a.75.75 0 0 1-1.06 1.06L2.47 12.53a.75.75 0 0 1 0-1.06l6.364-6.364a.75.75 0 0 1 1.06 0Z"/></svg>`;
export const timeSvg = `<svg width="14" height="15" fill="currentColor"><path d="M7.4335 4.241a.4376.4376 0 0 0-.871.0594v3.783l.0044.0622a.4375.4375 0 0 0 .1921.3029L8.9242 9.877l.0566.0317a.4376.4376 0 0 0 .5495-.1559l.0317-.0566a.4376.4376 0 0 0-.1559-.5495L7.4375 7.8471V4.3004l-.004-.0593ZM7 1.6667c-3.2217 0-5.8333 2.6116-5.8333 5.8333 0 3.2217 2.6116 5.8333 5.8333 5.8333 3.2217 0 5.8333-2.6116 5.8333-5.8333 0-3.2217-2.6116-5.8333-5.8333-5.8333Zm0 .814c2.7721 0 5.0194 2.2472 5.0194 5.0193 0 2.7721-2.2473 5.0194-5.0194 5.0194S1.9806 10.2721 1.9806 7.5 4.228 2.4806 7 2.4806Z"/></svg>`;
