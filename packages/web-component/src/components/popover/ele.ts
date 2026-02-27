import { html } from '../../utils';
import {
    type BaseEmits,
    EleMixin,
    type Emit2EventMap,
    UiBase,
    booleanAttr
} from '../web-component-base';
import { styleStr } from './css';
import { PopEle } from './pop-ele';

export const props = {
    open: booleanAttr('open'),
    disabled: booleanAttr('disabled')
};

export interface Emits extends BaseEmits {
    'open-change': boolean;
}
export type EventMap = Emit2EventMap<Emits>;

const cacheStyle: {
    -readonly [k in keyof CSSStyleDeclaration]?: any;
} = {};
let hiddenCount = 0;
const hiddenBodyOverflow = () => {
    if (hiddenCount++) return;
    const { style } = document.body;
    (Array.from(style) as (keyof CSSStyleDeclaration)[]).forEach((prop) => {
        cacheStyle[prop] = style[prop];
    });
    style.overflow = 'hidden';
};
const resetBodyOverflow = () => {
    if (--hiddenCount > 0) return;
    const { style } = document.body;
    style.overflow = '';
    for (const prop in cacheStyle) {
        style[prop] = cacheStyle[prop];
        Reflect.deleteProperty(cacheStyle, prop);
    }
};

// 全局气泡池，复用气泡元素
const popPool: PopEle[] = [];
const getPopFromPool = () => popPool.pop() || new PopEle();
const returnPopToPool = (pop: PopEle) => {
    pop.open = false;
    pop.setTrigger(null);
    pop.setController(null);
    popPool.push(pop);
};

/**
 * 点击触发器后气泡弹出
 * dt-popover 作为控制器，管理触发器和气泡的生命周期
 * 气泡实际挂载到 body 上，避免堆叠上下文问题
 */
export class Ele extends EleMixin(props, {} as Emits, UiBase) {
    public static readonly tagName = 'dt-popover' as const;
    protected static _style = styleStr;
    protected static _template =
        html`<slot name="trigger" part="trigger"></slot><slot name="pop" part="pop"></slot>`;

    get _staticEls() {
        return {
            ...super._staticEls,
            pop: this.$0<HTMLSlotElement>`slot[name="pop"]`!,
            trigger: this.$0<HTMLSlotElement>`slot[name="trigger"]`!
        } as const;
    }
    private get _triggerAssignedEle() {
        return this._els.trigger.assignedElements({ flatten: true })[0] as
            | HTMLElement
            | undefined;
    }

    /** 实际的气泡元素（挂载在 body 上） */
    private _popEle: PopEle | null = null;
    /** 气泡内容容器 */
    private _popContent: HTMLElement | null = null;

    /**
     * toggle open state
     * @returns null if disabled, otherwise the new open state
     */
    public toggleOpen = (force = !this.open) => {
        if (this.disabled) return null;
        return (this.open = force);
    };

    public connectedCallback() {
        if (!super.connectedCallback()) return;
        this._bindEvt(this._els.trigger)('click', this._onTriggerClick);

        // 监听 slot 变化，初始化气泡
        this._bindEvt(this._els.pop)('slotchange', this._initPop);
        this._initPop();
    }

    private _initPop = () => {
        if (this._popEle) return; // 已初始化

        const popContent = this._els.pop.assignedElements({
            flatten: true
        })[0] as HTMLElement | undefined;
        if (!popContent) return;

        this._popContent = popContent;
        this._popEle = getPopFromPool();
        this._popEle.setTrigger(this._triggerAssignedEle || this);
        this._popEle.setController(this);

        // 同步属性
        const syncAttrs = () => {
            if (!this._popEle) return;
            this._popEle.placement =
                (this.getAttribute('pop-placement') as any) || 'bottom-start';
            this._popEle.strategy =
                (this.getAttribute('pop-strategy') as any) || 'fixed';
            this._popEle.offset = +this.getAttribute('pop-offset') || 0;
            if (this.hasAttribute('pop-min-width-with-trigger')) {
                this._popEle.setAttribute('min-width-with-trigger', '');
            } else {
                this._popEle.removeAttribute('min-width-with-trigger');
            }
        };

        this._bindEvt(this)('dt-attribute-changed', (e) => {
            if (e.detail.name.startsWith('pop-')) {
                syncAttrs();
            }
        });

        // 监听气泡打开状态变化
        this._bindEvt(this._popEle)('open-change', (e) => {
            this.open = e.detail;
        });

        // 将气泡内容移动到气泡元素中
        this._popEle.appendChild(popContent);

        // 初始不添加到 body，等打开时再添加
    };

    public disconnectedCallback() {
        this._cleanupPop();
        document.removeEventListener('click', this._onDocClick, true);
        return super.disconnectedCallback();
    }

    protected _onAttrChanged(
        name: string,
        oldValue: string | null,
        newValue: string | null
    ) {
        super._onAttrChanged(name, oldValue, newValue);
        if (name !== 'open') return;
        const isOpen = newValue !== null;

        setTimeout(() => {
            document[(isOpen ? 'add' : 'remove') + 'EventListener'](
                'click',
                this._onDocClick,
                true
            );
        });

        if (this._popEle) {
            if (isOpen) {
                // 打开时添加到 body
                if (!this._popEle.isConnected) {
                    document.body.appendChild(this._popEle);
                }
                this._popEle.open = true;
            } else {
                // 关闭时从 body 移除并回收到池
                this._cleanupPop();
            }
        }

        if (this._isSmallScreen) {
            if (isOpen) hiddenBodyOverflow();
            else resetBodyOverflow();
        }
        this.dispatchEvent('open-change', this.open, true);
    }

    private _cleanupPop() {
        if (this._popEle) {
            this._popEle.open = false;
            if (this._popEle.isConnected) {
                this._popEle.remove();
            }
            returnPopToPool(this._popEle);
            this._popEle = null;
        }
    }

    private _onTriggerClick = () => {
        this.toggleOpen();
    };

    private _onDocClick = (e: MouseEvent) => {
        const popEle = this._popEle;
        if (popEle) {
            const composedPath = e.composedPath();
            if (composedPath.includes(popEle)) return;
            if (composedPath.includes(this)) {
                const popRect = popEle.getBoundingClientRect();
                if (
                    e.clientX >= popRect.left &&
                    e.clientX <= popRect.right &&
                    e.clientY >= popRect.top &&
                    e.clientY <= popRect.bottom
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

    protected _onScreenSizeChanged(isSmall: boolean) {
        super._onScreenSizeChanged(isSmall);
        if (!this.open) return;
        if (isSmall) {
            if (this._popEle) {
                this._popEle.open = false;
            }
            hiddenBodyOverflow();
        } else {
            if (this._popEle) {
                this._popEle.open = true;
            }
            resetBodyOverflow();
        }
    }
}

Ele.define();
