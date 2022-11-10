"use strict";

function getTagNames(srcArray) {
  var tagNames = [];
  srcArray.forEach(function (element) {
    tagNames.push(element["Key"]);
  });
  return tagNames;
}

function executeSetStandardTags() {
  if (!this.config.createStandardResourceTags) {
    this.log("Create standard resource tags is disabled, skipping ...", true);
  } else {
    // Init
    var _this = this;
    var resourceTagsPrefix = this.config.resourceTagsPrefix || "";
    var resourceTagsAdditionalTypes =
      this.config.resourceTagsAdditionalTypes || [];
    const template =
      this.serverless.service.provider.compiledCloudFormationTemplate;
    const supportedTypes = [
      "AWS::ApiGateway::Stage",
      "AWS::CloudFront::Distribution",
      "AWS::DynamoDB::Table",
      "AWS::Events::EventBus",
      "AWS::IAM::Role",
      "AWS::Kinesis::Stream",
      "AWS::Lambda::Function",
      "AWS::Logs::LogGroup",
      "AWS::S3::Bucket",
      "AWS::SQS::Queue",
      ...resourceTagsAdditionalTypes,
    ];

    // Initialize with anything already in stackTags, those take precedence
    var newStackTags = [];
    if (typeof this.serverless.service.provider.stackTags === "object") {
      var tags = this.serverless.service.provider.stackTags;
      Object.keys(tags).forEach(function (tagName) {
        newStackTags.push({ Key: tagName, Value: tags[tagName] });
      });
    }
    var manualStackTagNames = getTagNames(newStackTags);

    // Add new "standard" stack tags
    var standardTags = {
      Business: "",
      Department: "",
      Subdepartment: "",
      Maintainers: "",
      CostCenter: "",
      AppName: this.slsValues.appName,
      ServiceName: this.slsValues.serviceName,
      AppVersion: "",
      AppEnv: this.slsValues.appStage,
      AppRole: "",
      AppAccountId: { Ref: "AWS::AccountId" },
      AppRegion: this.slsValues.region,
    };
    Object.assign(standardTags, this.config.resourceTagsData);
    this.log(
      "The following is the standard list of resource tags computed ...",
      true
    );
    Object.keys(standardTags).forEach((tagName) => {
      var label = resourceTagsPrefix
        ? resourceTagsPrefix + ":" + tagName
        : tagName;
      var value = standardTags[tagName] || "";
      if (manualStackTagNames.indexOf(label) === -1) {
        this.log('... "' + label + '" = ' + value);
        newStackTags.push({ Key: label, Value: value });
      }
    });

    // Compiled resources
    this.log(
      "Adding standard resource tags to the following resources ...",
      true
    );
    Object.keys(template.Resources).forEach((resourceName) => {
      var resourceType = template.Resources[resourceName]["Type"];

      if (
        supportedTypes.indexOf(resourceType) !== -1 &&
        Array.isArray(newStackTags) &&
        newStackTags.length > 0
      ) {
        var resourceProperties = template.Resources[resourceName]["Properties"];
        if (resourceProperties) {
          this.log("... " + resourceType + " (" + resourceName + ")");

          var tags = resourceProperties["Tags"];
          if (!tags) {
            template.Resources[resourceName]["Properties"]["Tags"] =
              newStackTags;
          } else {
            template.Resources[resourceName]["Properties"]["Tags"] =
              tags.concat(
                newStackTags.filter(
                  (obj) => getTagNames(tags).indexOf(obj["Key"]) === -1
                )
              );
          }
        }
      } else {
        this.log(
          "...    INFO ... Not adding tags to resource " +
            resourceType +
            " (" +
            resourceName +
            ")"
        );
      }
    });
  } // END enabled?
} // END executeSetStandardTags

module.exports = executeSetStandardTags;
