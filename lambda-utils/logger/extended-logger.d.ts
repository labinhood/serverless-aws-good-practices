export = agpLogger;
declare const agpLogger: AgpLogger;
declare class AgpLogger extends PowerToolsLogger {
    log(levelName: any, message: any, params: any): void;
}
import PowerToolsLogger = require("@dazn/lambda-powertools-logger");
