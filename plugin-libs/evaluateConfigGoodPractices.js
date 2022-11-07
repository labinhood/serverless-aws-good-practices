"use strict";

var _ = require("lodash");

// Evaluates our opinionated good practices :) ;) :*
function evaluateConfigGoodPractices() {
  this.log("Evaluating configuration good practices and conventions ...", true);

  // Deployment bucket configuration
  // Standard configuration of deploymentBucket allows reusing a single bucket
  // per AWS account for all Serverless deployments, preventing waste and leaving
  // unused buckets behind
  this.log('... Reviewing "provider.deploymentBucket" settings');
  var depBucketConvention = {
    name: "serverless-deployment-bucket-account-${aws:accountId}-${aws:region}",
    serverSideEncryption: "AES256",
    blockPublicAccess: true,
  };
  var currentDepBucketConfig = this.get(
    this.serverless,
    "configurationInput.provider.deploymentBucket",
    {}
  );
  var matchesConvention = _.isEqual(
    depBucketConvention,
    currentDepBucketConfig
  );
  if (matchesConvention) {
    this.log("... OK");
  } else {
    this.log(
      '"provider.deploymentBucket" does not match the recommended configuration; recommended settings are:',
      false,
      true
    );
    Object.keys(depBucketConvention).forEach((key) => {
      this.log("...   " + key + " = " + depBucketConvention[key], false, true);
    });
    if (this.config.checkDeploymentBucketConfig) {
      this.error(
        '"provider.deploymentBucket" does not match the recommended configuration (details above), set "checkDeploymentBucketConfig = false" if you prefer to ignore',
        false,
        true
      );
    }
  }
}

module.exports = evaluateConfigGoodPractices;
