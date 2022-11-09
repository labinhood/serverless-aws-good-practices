"use strict";

var { log, error, get } = require("./plugin-libs/util");
var evaluateConfigGoodPractices = require("./plugin-libs/evaluateConfigGoodPractices");
var {
  executeSetStandardEnvVars,
  finalizeStandardEnvVars,
} = require("./plugin-libs/executeSetStandardEnvVars");
var executeSetStandardTags = require("./plugin-libs/executeSetStandardTags");
var getCustomVarsConfig = require("./plugin-libs/getCustomVarsConfig");

class AWSGoodPracticesPlugin {
  constructor(serverless, options, v3Utils) {
    this.serverless = serverless;
    this.options = options;
    this.v3Utils = v3Utils;
    this.provider = serverless.getProvider("aws");
    this.pluginName = "AWS Good Practices Plugin";
    this.customConfigSectionName = "awsGoodPractices";

    // Shared util
    this.log = log;
    this.error = error;
    this.get = get;

    // Initialize
    this.initSlsValues.bind(this)();
    this.initPluginConfig.bind(this)();

    // Configuration good practices
    evaluateConfigGoodPractices.bind(this)();

    // setEnvVars? - standard environment variables for Lambda
    if (this.config.setStandardEnvVars) {
      executeSetStandardEnvVars.bind(this)();
    }

    // enableCustomVars - enables resolution of "agp:" prefixed custom vars
    this.log(
      'Enabling AGP custom variables recognition ("${agp:sls-default-name}" and "${agp:sls-regional-name}") ...',
      true
    );
    this.configurationVariablesSources = getCustomVarsConfig();

    this.hooks = {
      "after:aws:package:finalize:mergeCustomProviderResources": () => {
        executeSetStandardTags.bind(this)();
        finalizeStandardEnvVars.bind(this)();
      },
    };
    // Uncomment for plugin development, it prints out lifecycle events/hooks
    // this.printHook('[plugin_constructor]');
    // this.subscribeAndPrintLifecycleEvents.bind(this)();
  }

  // Collect required values from Serverless context or fail
  initSlsValues() {
    this.log("Verifying Serverless context ...");
    this.slsValues = {
      appName: this.serverless.configurationInput.app || "",
      appStage: this.serverless.service.provider.stage || "",
      serviceName: this.serverless.service.service || "",
      region: this.serverless.service.provider.region || "",
    };
  }

  // Collect and validate plugin's configuration
  initPluginConfig() {
    this.log("Collecting and verifying plugin's configuration ..", true);
    this.config = Object.assign(
      {
        setStandardResourceTags: true,
        setStandardEnvVars: true,
        checkDeploymentBucketConfig: true,
        loggerLogLevel: "INFO",
        loggerDebugSampleRate: 0.01,
        resourceTagsPrefix: "agp",
        resourceTagsData: {},
        resourceTagsAdditionalTypes: [],
      },
      (this.serverless.service.custom &&
        this.serverless.service.custom[this.customConfigSectionName]) ||
        {}
    );

    // Other adjustments
    // Ensure resourceTagsData.costcenter is set, or apply a default
    if (!this.config.resourceTagsData.CostCenter) {
      this.config.resourceTagsData.CostCenter =
        this.config.resourceTagsData.Department;
    }
  }

  // Useful for plugin development
  subscribeAndPrintLifecycleEvents() {
    for (let event in this.serverless.pluginManager.hooks) {
      if (event.startsWith("before:") || event.startsWith("after:")) {
        this.hooks[event] = this.printHook.bind(this, event);
      } else {
        const beforeEvent = "before:" + event;
        this.hooks[beforeEvent] = this.printHook.bind(this, beforeEvent);

        const afterEvent = "after:" + event;
        this.hooks[afterEvent] = this.printHook.bind(this, afterEvent);
      }
    }
  }
  printHook(event) {
    console.log(" IN: %s", event);
    console.log(this.serverless.isConfigurationInputResolved);
    console.log(this.serverless.configurationInput.provider.deploymentBucket);
  }
} // END class AWSGoodPracticesPlugin

// Default "require()" type export for this module (Serverless Plugin)
module.exports = AWSGoodPracticesPlugin;
