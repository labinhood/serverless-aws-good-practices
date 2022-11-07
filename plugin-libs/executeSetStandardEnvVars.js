"use strict";

function executeSetStandardEnvVars() {
  this.log("Setting baseline environment variables ...", true);

  // Stands for AWS Good Practices, exact names are
  var varsToBeSet = {
    AGP_APP_NAME: this.slsValues.appName,
    AGP_SERVICE_NAME: this.slsValues.serviceName,
    AGP_APP_ENV: this.slsValues.appStage,
    AGP_APP_ROLE: this.config.resourceTagsData["AppRole"] || "",
    AGP_APP_ACCOUNT_ID: "#{AWS_ACCOUNT_ID}#",
    AGP_APP_REGION: this.slsValues.region,
    AGP_APP_VERSION: this.config.resourceTagsData["AppVersion"] || "",
    AWS_NODEJS_CONNECTION_REUSE_ENABLED: 1,
    LOG_LEVEL: this.config.loggerLogLevel,
    NODE_OPTIONS: "--enable-source-maps --stack-trace-limit=1000",
    POWERTOOLS_IGNORE_ERRORS: true,
    SAMPLE_DEBUG_LOG_RATE: this.config.loggerDebugSampleRate,
  };
  if (!this.serverless.service.provider.environment)
    this.serverless.service.provider.environment = {};
  Object.keys(varsToBeSet).forEach((key) => {
    this.log("... " + key + " to: " + varsToBeSet[key]);
    this.serverless.service.provider.environment[key] = varsToBeSet[key];
  });
}

function _isDict(v) {
  return (
    typeof v === "object" &&
    v !== null &&
    !(v instanceof Array) &&
    !(v instanceof Date)
  );
}

function finalizeStandardEnvVars() {
  const template =
    this.serverless.service.provider.compiledCloudFormationTemplate;

  Object.keys(template).forEach((identifier) => {
    replaceChildNodes(template[identifier], identifier);
  });

  function replaceChildNodes(dictionary, name) {
    Object.keys(dictionary).forEach((key) => {
      let value = dictionary[key];

      if (value === "#{AWS_ACCOUNT_ID}#") {
        dictionary[key] = { Ref: "AWS::AccountId" };
      }

      // dicts and arrays need to be looped through
      if (_isDict(value) || Array.isArray(value)) {
        dictionary[key] = replaceChildNodes(value, name + "::" + key);
      }
    });
    return dictionary;
  }
}

module.exports = { executeSetStandardEnvVars, finalizeStandardEnvVars };
