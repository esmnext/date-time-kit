import { html } from "@/utils";
import { BaseAttrs, DefEle, UiBase } from "../web-component-base";
import '@/components/i18n';

export interface PopoverAttrs extends BaseAttrs {
    'open'?: boolean;
    'disabled'?: boolean;
}

export interface PopoverEmit {
    'open-change': boolean;
}

/**
 * 点击触发器后气泡弹出
 */
@DefEle('popover')
export default class Popover extends UiBase<PopoverAttrs, PopoverEmit> {
    static get observedAttributes(): string[] {
        return [
            ...(super.observedAttributes as (keyof BaseAttrs)[]),
            'open',
            'disabled'
        ] satisfies (keyof PopoverAttrs)[];
    }

    protected _template = html`<slot name="trigger"></slot><slot name="pop" style="display:none"></slot>`;

    constructor() {
        super();
        this._applyTemplate();
    }

    private get _popEle() {
        return this.shadowRoot?.querySelector('slot[name="pop"]') as HTMLDivElement;
    }
    private get _triggerEle() {
        return this.shadowRoot?.querySelector('slot[name="trigger"]') as HTMLSlotElement;
    }

    public get open() {
        return this.hasAttribute('open');
    }
    public set open(v: boolean) {
        this.toggleAttribute('open', v);
    }
    public get disabled() {
        return this.hasAttribute('disabled');
    }
    public set disabled(v: boolean) {
        this.toggleAttribute('disabled', v);
    }
    /**
     * toggle open state
     * @returns null if disabled, otherwise the new open state
     */
    public toggleOpen = (force: boolean = !this.open) => {
        if (this.disabled) return null;
        return this.open = force;
    };

    public connectedCallback() {
        if (!super.connectedCallback()) return;
        this._triggerEle.addEventListener('click', this._onToggleClick);
    }
    public disconnectedCallback() {
        if (!super.disconnectedCallback()) return;
        this._triggerEle.removeEventListener('click', this._onToggleClick);
    }

    protected _onAttrChanged(name: string, oldValue: string, newValue: string) {
        super._onAttrChanged(name, oldValue, newValue);
        if (name !== 'open') return;
        const isOpen = newValue !== null;
        this._popEle.style.display = !isOpen ? 'none' : '';
        if (typeof document !== 'undefined') {
            setTimeout(() => {
                if (isOpen) document.addEventListener('click', this._onDocClick, true);
                else document.removeEventListener('click', this._onDocClick, true);
            });
        }
        this.dispatchEvent('open-change', this.open, true);
    }

    private _onToggleClick = () => { this.toggleOpen(); };
    private _onDocClick = (e: MouseEvent) => {
        const popEle = this.querySelector('[slot="pop"]');
        if (popEle) {
            if (e.composedPath().includes(popEle)) return;
            if (e.composedPath().includes(this)) {
                const popRect = popEle.getBoundingClientRect();
                if (e.clientX >= popRect.left && e.clientX <= popRect.right &&
                    e.clientY >= popRect.top && e.clientY <= popRect.bottom
                ) {
                    return;
                }
            }
        }
        e.stopPropagation();
        e.preventDefault();
        this.open = false;
        document.removeEventListener('click', this._onDocClick, true);
    };
}
