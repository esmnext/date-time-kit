export type AttrAccessor<G = any, S = G> = {
    attrName?: string;
    get: () => G;
    set?: (value: S) => void;
};
