declare function _exports(thresholdMillis?: number): {
    before: (request: any) => Promise<void>;
    after: (request: any) => Promise<void>;
    onError: (request: any) => Promise<void>;
};
export = _exports;
