# Serverless AWS Good Practices

A Serverless Framework plugin, and set of Lambda utils to initialize your project with **opinionated** good practices for Lambda-based Serverless applications.

The plugin is compatible with both v2 and v3 Serverless versions, as well as both its TypeScript and YML configuration flavours.

## Table of Contents

- [Installation](#installation)
- [Configuration](#configuration)
- [Serverless Plugin, Why and What?](#serverless-plugin-why-and-what)
- [Set Standard Resource Tags (setStandardResourceTags = True)](#set-standard-resource-tags-setstandardresourcetags--true)

## Usage Documentation

### Installation

```bash
$ npm install --save @labinhood/serverless-aws-good-practices
```

### Configuration

For a detailed explanation of what each configuration option does, please refer to the [Serverless Plugin, Why and What?](#serverless-plugin-why-and-what) section below.

The available configuration options and defaults are:

#### TypeScript (serverless.ts)

```typescript
{
  custom: {
    awsGoodPractices: {
      setStandardResourceTags: true,
      setStandardEnvVars: true,
      checkDeploymentBucketConfig: true,
      loggerLogLevel: "INFO",
      loggerDebugSampleRate: 0.01,
      resourceTagsPrefix: "agp",
      resourceTagsData: {
        Business: "[default: empty]",
        Department: "[default: empty]",
        Subdepartment: "[default: empty]",
        Maintainers: "[default: empty]",
        CostCenter: "[default: empty]",
        AppName: "[auto-populated: Serverless 'app' prop]",
        ServiceName: "[auto-populated: Serverless 'service' prop]",
        AppVersion: "[default: empty, recommended: inject with CI/CD]",
        AppEnv: "[auto-populated: Serverless 'provider.stage' prop]",
        AppRole: "[default: empty]",
        AppAccountId: "[auto-populated: AWS account ID]",
        AppRegion: "[auto-populated: deploy region]"
      },
      resourceTagsAdditionalTypes: []
    }
  }
}
```

#### YML (serverless.yml)

```yml
custom:
  awsGoodPractices:
    setStandardResourceTags: true
    setStandardEnvVars: true
    checkDeploymentBucketConfig: true
    loggerLogLevel: "INFO"
    loggerDebugSampleRate: 0.01
    resourceTagsPrefix: "agp"
    resourceTagsData:
      Business: "[default: empty]"
      Department: "[default: empty]"
      Subdepartment: "[default: empty]"
      Maintainers: "[default: empty]"
      CostCenter: "[default: empty]"
      AppName: "[auto-populated: Serverless 'app' prop]"
      ServiceName: "[auto-populated: Serverless 'service' prop]"
      AppVersion: "[default: empty]"
      AppEnv: "[auto-populated: Serverless 'provider.stage' prop]"
      AppRole: "[default: empty]"
      AppAccountId: "[auto-populated: AWS account ID]"
      AppRegion: "[auto-populated: deploy region]"
    resourceTagsAdditionalTypes:
      - "[AdditionalTypeIfAny_A]"
      - "[AdditionalTypeIfAny_B]"
```

### Serverless Plugin, Why and What?

The [Serverless Framework](https://www.serverless.com/) is great for building Serverless applications, and over time our team identified a set of boilerplate good practices we wanted to include in all of our projects for observability and cost reporting reasons.

Our team also wanted to be able to add and update fast and efficiently our good practices as they evolved, the plugin mechanism of the Serverless Framework provided such means, and here we are :)

#### Set Standard Resource Tags (setStandardResourceTags = True)

AWS resource tags are of great help for reporting, specially in a multi-account and/or multi-application environment, given they can provide high level views of cost across the organization by combinining those tags in different ways. e.g. how much all AppEnv = 'staging' resources are costing us across departments, or only those of Department = 'marketing', etc.

With the **setStandardResourceTags** plugin's config prop set to true (default), the plugin adds a set of standard tags to the following resources created by the Serverless application during deployment:

- AWS::ApiGateway::Stage
- AWS::CloudFront::Distribution
- AWS::DynamoDB::Table
- AWS::IAM::Role
- AWS::Kinesis::Stream
- AWS::Lambda::Function
- AWS::Logs::LogGroup
- AWS::S3::Bucket
- AWS::SQS::Queue

For future extensibility, the plugin also supports a "**resourceTagsAdditionalTypes**" config prop, where additional resource types can be passed to include with the list; just beware the targeted resources must support the "Tags" CloudFormation property, otherwise your deployment will fail.

About the tags themselves, we tried to provide a set of standard values appropriate for most classification and reporting needs, and to auto-populate some with runtime values by default (they all can be overriden if desired, even the ones we populate automatically).

The list of resource tags the plugin creates, and defaults are the following:

| Tag Name      | Default Value                          | Additional Information                                                                                                                                                                                                 |
| :------------ | :------------------------------------- | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Business      | (Empty)                                |                                                                                                                                                                                                                        |
| Department    | (Empty)                                |                                                                                                                                                                                                                        |
| Subdepartment | (Empty)                                |                                                                                                                                                                                                                        |
| Maintainers   | (Empty)                                |                                                                                                                                                                                                                        |
| CostCenter    | (Empty)                                |                                                                                                                                                                                                                        |
| AppName       | Auto: Serverless 'app' prop            |                                                                                                                                                                                                                        |
| ServiceName   | Auto: Serverless 'service' prop        |                                                                                                                                                                                                                        |
| AppVersion    | (empty)                                | Recommended: inject with CI/CD via CLI params like `serverless deploy --param="appVersion=$VERSION_TAG"` and in your Serverless custom.awsGoodPractices.resourceTagsData config: `AppVersion: ${param:appVersion, ''}` |
| AppEnv        | Auto: Serverless 'provider.stage' prop |                                                                                                                                                                                                                        |
| AppRole       | (Empty)                                |                                                                                                                                                                                                                        |
| AppAccountId  | Auto: Deployment AWS account ID        |                                                                                                                                                                                                                        |
| AppRegion     | Auto: Deployment AWS region            |                                                                                                                                                                                                                        |

#### Set Standard Environment Variables (setStandardEnvVars = True)

Similar to the automatic creation of resource tags, the plugin also injects a set of standard environment variables, it does this by adding such definitions to the "provider.environment" property of Serverless, so resources like all of your Lambda functions receive such environment variables by default, exactly the same as if you had added them manually to the Serverless property.

Application specific environment variables can still be added to "provider.environment" and those do not conflict with the plugin but work in tandem, in such case, the resulting env vars will be the combination of the standard tags the plugin adds and your custom ones.

If desired, standard variables added by the plugin could also be overriden through "provider.environment" custom values, but the idea is that you do not have to, given they are also auto-populated with sensible defaults.

The following is the list of environment variables the plugin adds by default to the "provider.environment" of Serverless:

| Env Var Name                        | Value                                                                                       | Additional Information                                                                                                                                                                                           |
| :---------------------------------- | :------------------------------------------------------------------------------------------ | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| AGP_APP_NAME                        | Auto: Serverless 'app' prop                                                                 |                                                                                                                                                                                                                  |
| AGP_SERVICE_NAME                    | Auto: Serverless 'service' prop                                                             |                                                                                                                                                                                                                  |
| AGP_APP_ENV                         | Auto: Serverless 'provider.stage' prop                                                      |                                                                                                                                                                                                                  |
| AGP_APP_ROLE                        | Value of 'resourceTagsData.AppRole' plugin's config prop if provided                        |                                                                                                                                                                                                                  |
| AGP_APP_ACCOUNT_ID                  | Auto: Deployment AWS account ID                                                             |                                                                                                                                                                                                                  |
| AGP_APP_REGION                      | Auto: Deployment AWS region                                                                 |                                                                                                                                                                                                                  |
| AGP_APP_VERSION                     | Value of 'resourceTagsData.AppVersion' plugin's config prop if provided                     | Recommended: inject via CI/CD as explained in the tags table section above                                                                                                                                       |
| AWS_NODEJS_CONNECTION_REUSE_ENABLED | 1                                                                                           | Configures the AWS SDK for JavaScript to reuse TCP connections and hence improving performance, as described by: https://docs.aws.amazon.com/sdk-for-javascript/v2/developer-guide/node-reusing-connections.html |
| LOG_LEVEL                           | default: 'INFO', or the value of the plugin's config prop 'loggerLogLevel' if provided      | This sets the default log level of the Logger class component provided with the plugin, for more informatin about that, please refer to the [Logger Instance](#logger-instance) section                          |
| NODE_OPTIONS                        | "--enable-source-maps --stack-trace-limit=1000"                                             |                                                                                                                                                                                                                  |
| POWERTOOLS_IGNORE_ERRORS            | true                                                                                        |                                                                                                                                                                                                                  |
| SAMPLE_DEBUG_LOG_RATE               | default: 0.01, or the value of the plugin's config prop 'loggerDebugSampleRate' if provided | Please refer to the [Logger Instance](#logger-instance) section of this document for more information about this variable                                                                                        |

### Lambda Utils

test

#### Middy Wrap "Essentials"

test

#### Logger Instance

#### Standarized Log Messages Samples
