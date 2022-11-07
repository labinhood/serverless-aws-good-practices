var PowerToolsLogger = require("@dazn/lambda-powertools-logger");

const EXTENDED_CONTEXT = {
  awsAccountId: process.env.AGP_APP_ACCOUNT_ID,
  appName: process.env.AGP_APP_NAME,
  serviceName: process.env.AGP_SERVICE_NAME,
  appEnv: process.env.AGP_APP_ENV,
  appVersion: process.env.AGP_APP_VERSION,
};

class AgpLogger extends PowerToolsLogger {
  // This method is used internally by all: 'debug', 'info', 'warn' and 'error' methods
  // so overriding this one is enough to extend the context for all
  log(levelName, message, params) {
    var newParams = {
      ...params,
      ...EXTENDED_CONTEXT,
    };
    super.log(levelName, message, newParams);
  }
}

const agpLogger = new AgpLogger();

module.exports = agpLogger;
