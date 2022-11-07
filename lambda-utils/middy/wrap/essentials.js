var middy = require("@middy/core");
var errorLogger = require("@middy/error-logger");
var Log = require("./../../logger/extended-logger");
var doNotWaitForEmptyEventLoop = require("@middy/do-not-wait-for-empty-event-loop");
var captureCorrelationIds = require("@dazn/lambda-powertools-middleware-correlation-ids");
var sampleLogging = require("@dazn/lambda-powertools-middleware-sample-logging");
var extendedLogTimeout = require("./../middleware/extended-log-timeout");

var logErrorFn = (err) => {
  Log.error("invocation failed", err);
};

module.exports = (f) => {
  return (
    middy(f)
      // Middy middleware for capturing any error that is not caught by the application
      // The specific log function is overriden to our modified version of the PowerTools Logger
      // which injects additional attributes like App, Service names, Account ID, etc.
      .use(errorLogger({ logger: logErrorFn }))
      // Middy middleware that sets context.callbackWaitsForEmptyEventLoop property to false
      // This will prevent Lambda from timing out because of open database connections, etc.
      // https://middy.js.org/packages/do-not-wait-for-empty-event-loop/
      .use(doNotWaitForEmptyEventLoop({ runOnAfter: true, runOnError: true }))
      // Middy middleware for recording correlation IDs
      // https://github.com/getndazn/dazn-lambda-powertools/tree/master/packages/lambda-powertools-correlation-ids
      .use(
        captureCorrelationIds({
          sampleDebugLogRate: parseFloat(
            process.env.SAMPLE_DEBUG_LOG_RATE || "0.01"
          ),
        })
      )
      // Middy middleware that will enable debug logging for a configurable % of invocations
      // https://github.com/getndazn/dazn-lambda-powertools/tree/master/packages/lambda-powertools-middleware-sample-logging
      .use(
        sampleLogging({
          sampleRate: parseFloat(process.env.SAMPLE_DEBUG_LOG_RATE || "0.01"),
        })
      )
      // Middy middleware that will log a timeout error message just before the function actually times out
      // Custom version to use extended logger. Based on:
      //   https://github.com/getndazn/dazn-lambda-powertools/tree/master/packages/lambda-powertools-middleware-log-timeout
      .use(extendedLogTimeout())
  );
};
