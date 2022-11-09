export const middyWrapEssentials: (f: any) => any;
export const Log: {
    log(levelName: any, message: any, params: any): void;
    correlationIds: import("@dazn/lambda-powertools-correlation-ids");
    originalLevel: string;
    level: string;
    appendError<T>(params: T, err: Error): T & Error;
    debug(message: string, params?: Record<string, any>): void;
    enableDebug(): () => void;
    error(message: string, err?: Error): void;
    error(message: string, params?: Record<string, any>, err?: Error): void;
    info(message: string, params?: Record<string, any>): void;
    isEnabled(level: 20 | 30 | 40 | 50): Boolean;
    resetLevel(): void;
    warn(message: string, err?: Error): void;
    warn(message: string, params?: Record<string, any>, err?: Error): void;
};
