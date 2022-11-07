# Serverless AWS Good Practices

A Serverless Framework plugin, and set of Lambda utils to initialize your project with **opinionated** good practices for Lambda-based Serverless applications.

The plugin is compatible with both v2 and v3 Serverless versions, as well as both its TypeScript and YML configuration flavours.

## Table of Contents

- [Installation](#installation)
- [Configuration](#configuration)
- [Serverless Plugin Functionality](#serverless-plugin-functionality)
  - [Standard Resource Tags (setStandardResourceTags = True)](#standard-resource-tags-setstandardresourcetags--true)
  - [Standard Environment Variables (setStandardEnvVars = True)](#standard-environment-variables-setstandardenvvars--true)
  - [Plugin's Custom Variables](#plugins-custom-variables)
  - [Default Log Level](#default-log-level-loggerloglevel---debug--info--warn--error)
- [Lambda Utils](#lambda-utils)
  - [Middy Wrap "Essentials"](#middy-wrap-essentials)
  - [Logger Instance](#logger-instance)
  - [Usage: Middy Wrap "Essentials" and Logger Instance](#usage-middy-wrap-essentials-and-logger-instance)
  - [Standarized Log Messages Samples](#standarized-log-messages-samples)

## Usage Documentation

### Installation

```bash
$ npm install @labinhood/serverless-aws-good-practices --save
```

This will install the plugin in the main "dependencies" section of package.json, this is mainly needed if your code uses any of the [Lambda Utils](#lambda-utils) included with the package.

### Configuration

For a detailed explanation of what each configuration option does, please refer to the [Serverless Plugin Functionality](#serverless-plugin-functionality) section below.

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

### Serverless Plugin Functionality

The <a href="https://www.serverless.com/" target="_blank">Serverless Framework</a> is great for building Serverless applications, and over time our team identified a set of boilerplate good practices we wanted to include in all of our projects for observability and cost reporting reasons.

Our team also wanted to be able to add and update fast and efficiently our good practices as they evolved, the plugin mechanism of the Serverless Framework provided such means, and here we are :)

#### Standard Resource Tags (setStandardResourceTags = True)

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

#### Standard Environment Variables (setStandardEnvVars = True)

Similar to the automatic creation of resource tags, the plugin also injects a set of standard environment variables, it does this by adding such definitions to the "provider.environment" property of Serverless, so resources like all of your Lambda functions receive such environment variables by default, exactly the same as if you had added them manually to the Serverless property.

Application specific environment variables can still be added to "provider.environment" and those do not conflict with the plugin but work in tandem, in such case, the resulting env vars will be the combination of the standard tags the plugin adds and your custom ones.

If desired, standard variables added by the plugin could also be overriden through "provider.environment" custom values, but the idea is that you do not have to, given they are also auto-populated with sensible defaults.

The following is the list of environment variables the plugin adds by default to the "provider.environment" of Serverless:

| Env Var Name                        | Value                                                                                       | Additional Information                                                                                                                                                                                                                                                                                             |
| :---------------------------------- | :------------------------------------------------------------------------------------------ | :----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| AGP_APP_NAME                        | Auto: Serverless 'app' prop                                                                 |                                                                                                                                                                                                                                                                                                                    |
| AGP_SERVICE_NAME                    | Auto: Serverless 'service' prop                                                             |                                                                                                                                                                                                                                                                                                                    |
| AGP_APP_ENV                         | Auto: Serverless 'provider.stage' prop                                                      |                                                                                                                                                                                                                                                                                                                    |
| AGP_APP_ROLE                        | Value of 'resourceTagsData.AppRole' plugin's config prop if provided                        |                                                                                                                                                                                                                                                                                                                    |
| AGP_APP_ACCOUNT_ID                  | Auto: Deployment AWS account ID                                                             |                                                                                                                                                                                                                                                                                                                    |
| AGP_APP_REGION                      | Auto: Deployment AWS region                                                                 |                                                                                                                                                                                                                                                                                                                    |
| AGP_APP_VERSION                     | Value of 'resourceTagsData.AppVersion' plugin's config prop if provided                     | Recommended: inject via CI/CD as explained in the tags table section above                                                                                                                                                                                                                                         |
| AWS_NODEJS_CONNECTION_REUSE_ENABLED | 1                                                                                           | Configures the AWS SDK for JavaScript to reuse TCP connections and hence improving performance, as described by: https://docs.aws.amazon.com/sdk-for-javascript/v2/developer-guide/node-reusing-connections.html                                                                                                   |
| LOG_LEVEL                           | default: 'INFO', or the value of the plugin's config prop 'loggerLogLevel' if provided      | This sets the default log level of the Logger class component provided with the plugin, for more information about that, please refer to the [Logger Instance](#logger-instance) section                                                                                                                           |
| NODE_OPTIONS                        | "--enable-source-maps --stack-trace-limit=1000"                                             | NODE_OPTIONS defaults by the `serverless create --template aws-nodejs-typescript`, so you could remove such line from your main Serverless file configuration                                                                                                                                                      |
| POWERTOOLS_IGNORE_ERRORS            | true                                                                                        | We internally use Yan Cui's "lambda-powertools-logger" middleware, this setting disables its error handling so we can manage it instead through the Middy Wrap "Essentials" middleware included with the plugin. For more information please consult the [Middy Wrap "Essentials"](#middy-wrap-essentials) section |
| SAMPLE_DEBUG_LOG_RATE               | default: 0.01, or the value of the plugin's config prop 'loggerDebugSampleRate' if provided | Please refer to the [Logger Instance](#logger-instance) section of this document for more information about this variable                                                                                                                                                                                          |

#### Plugin's Custom Variables

The plugin also adds a couple of custom variables that can help in the standarization of resource naming.

What we observed when naming resources, is that concatenating manually by our team was error prone, for example, someone might start with the service name, and another team member might do stage name first, etc.; we added the following custom variables to make this simpler and ensure consistency, so feel free to use them anywhere in your configuration if useful:

| Custom Variable          | Description                                                                                                                                                                                                                                                                                                                      |
| :----------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| ${agp:sls-default-name}  | Returns the combination of: [service_name]-[stage_name]. It can be used to name resources that do not require the ‘regional level’ in their names (most resources)                                                                                                                                                               |
| ${agp:sls-regional-name} | Returns the combination of: [service_name]-[stage_name]-[region]. It can be used to name resources that DO require the 'regional level' in their names (e.g. IAM roles; given IAM is a global service, deployments of the same stack in multiple regions would cause role name clashes, use this prefix to avoid such scenarios) |

Usage example (works in both YML and TypeScript configurations):

```
DynamoTableOrders: {
    Type: 'AWS::DynamoDB::Table',
    Properties: {
      TableName: '${agp:sls-default-name}-Orders'
```

#### Deployment Bucket Recommended Configuration

Context:

By default, the Serverless Framework creates an S3 bucket in the target AWS account with a dynamically generated name to store files related to each stack it deploys, like:

```
myservicename-prod-serverlessdeploymentbucke-zshkvtwtq6s4
```

The problem with dynamically named deployment buckets, is that every service-stage combination of your application will create a new bucket in the target account, leaving multiple S3 buckets behind if there is not a solid cleanup routine as part of your CI/CD or workflow.

There is also a soft-limit of 100 buckets per account imposed by AWS, so if your applications create and rely on S3 buckets for user features, you and your team could find yourselves reaching the limit in some circumstances. The limit can be easily increased by submitting a request to AWS support, but in our opinion, it is much better to avoid the issue in the first place.

We can avoid the S3 bucket "junk yard" problem by setting our "provider.deploymentBucket" configuration of Serverless to the following recommended values (the same values work for YML and TypeScript configurations):

```
deploymentBucket: {
  name: 'serverless-deployment-bucket-account-${aws:accountId}-${aws:region}',
  serverSideEncryption: 'AES256',
  blockPublicAccess: true
}
```

The plugin checks your "provider.deploymentBucket" configuration, and fail your deployment if any of the settings is different or missing. You can skip the failure behaviour by setting **checkDeploymentBucketConfig** to false, in which case the plugin will still issue a warning, but it will not fail your deployment.

The reason these settings help, is that they make all services and stages utilize a single S3 bucket. The Serverless Framework stores all deployment bucket files in a service/stage directory structure by default, so it all works naturally well from there.

**IMPORTANT:** also, please ensure to install the "serverless-deployment-bucket" plugin and load it into your Serverless configuration, otherwise your deployment might fail the very first time when the bucket does not yet exist:

[Serverless Deployment Bucket Plugin](https://www.serverless.com/plugins/serverless-deployment-bucket)

```
npm install serverless-deployment-bucket --save-dev
...
# And in your Serverless configuration (YML in this example):

plugins:
  - serverless-deployment-bucket
```

#### Default Log Level (loggerLogLevel = [ DEBUG | INFO | WARN | ERROR ])

This plugin configuration prop sets the default level of the "Logger" for Lambda made available with this same node module, for more information about this, please refer to the [Logger Instance](#logger-instance) section below.

### Lambda Utils

Lambda Utils are importable objects and classes, complementary to actions performed by the Serverless Plugin functionality in the module, they help initialize Lambda functions with Serverless/AWS good practices, standardized logging, etc.

#### Middy Wrap "Essentials"

A "wrap" function that initializes Lambdas with essential Middy middleware that provides standarized logging, error handling and related functionality.

The following is the specific middleware it wraps, and the configuration it initializes:

1. Middy - Error Logger Middleware (npm: @middy/error-logger)
   Catches any uncaught exceptions by the application, and ensures a standardized message makes it to the log stream in such scenarios.

2. Middy - Do Not Wait for Empty Event Loop Middleware (npm: @middy/do-not-wait-for-empty-event-loop )
   Middy middleware that prevents Lambda from timing out because of open database connections, etc.

3. PowerTools - Capture Correlation Ids (npm: @dazn/lambda-powertools-middleware-correlation-ids)
   Middleware that helps capture and extend log messages with Correlation IDs.

4. PowerTools - Sample Logging (npm: @dazn/lambda-powertools-middleware-sample-logging)
   Middleware that enables the DEBUG log level to a configurable percentage of the invocations, which provides detailed samples for simpler Production troubleshooting.

5. PowerTools - Log Timeout (npm: @dazn/lambda-powertools-middleware-log-timeout)
   Middleware that sends standard log messages to the log stream for Lambda’s that timeout (which otherwise does not happen by default). A copy of this middleware was made and modified to use the Logger Instace documented below.

#### Logger Instance

The Logger instance is a good complement to the “Essentials“ Middy Wrap, it allows developers to easily add logging to applications that has a common structure across the team, which can be key to log aggregation and observability.

The Logger instance extends the PowerTools Logger by DAZN, adding a few new attributes to all messages; the usage is exactly the same as described by the original documentation:
https://github.com/getndazn/dazn-lambda-powertools/tree/master/packages/lambda-powertools-logger

The customized version of the “Logger“ extends log messages with the following attributes:

| Attribute    | Value From                                                                      |
| :----------- | :------------------------------------------------------------------------------ |
| awsAccountId |                                                                                 |
| appName      | "app" in Serverless configuration                                               |
| serviceName  | "service" in Serverless configuration                                           |
| appEnv       | Serverless "stage"                                                              |
| appVersion   | if provided, coming from the "resourceTagsData.AppVersion" plugin's config prop |

#### Usage: Middy Wrap "Essentials" and Logger Instance

Both the Middy Wrap "Essentials" and Logger Instance (Log.[method]) can be imported and used from code in the following way:

```js
import { middyWrapEssentials, Log } from '@labinhood/serverless-aws-good-practices';
...
// Create your handler function, like:
const baseHandler = async (event, context) => {
  // ... Business Logic

  // To send Log messages:
  Log.debug(msg, extraMsgAttributes);
  Log.info(msg, extraMsgAttributes);
  Log.warn(msg, extraMsgAttributes, err);
  Log.error(msg, extraMsgAttributes, err);

  // Enable debug mode - any "Log.debug" calls make it to the log stream
  Log.enableDebug();

  // Reset log level to initial setting - any Log entries "lower" than the initial "logLevel" are kept out of the log stream
  // (defined by the "custom.prGoodPracticesPlugin.logLevel" setting, with options: DEBUG, INFO, WARN, ERROR)
  Log.resetLevel();
}
...
// ... And wrap it, like:
export const handler = middyWrapEssentials(baseHandler)
```

#### Standarized Log Messages Samples

##### Log.debug('your message here')

```json
{
  "message": "your message here",
  "awsAccountId": "123456789012",
  "appName": "myapp",
  "serviceName": "myservice",
  "appEnv": "prod",
  "appVersion": "1.0.0",
  "awsRegion": "us-east-1",
  "functionName": "myapp-prod-MyLambdaFunction",
  "functionVersion": "$LATEST",
  "functionMemorySize": "128",
  "awsRequestId": "f56de7fd-fd99-4f12-834f-4e7ac5b16ea0",
  "x-correlation-id": "f56de7fd-fd99-4f12-834f-4e7ac5b16ea0",
  "debug-log-enabled": "false",
  "call-chain-length": 1,
  "level": 20,
  "sLevel": "DEBUG"
}
```

##### Log.info('your message here')

```json
{
  "message": "your message here",
  "awsAccountId": "123456789012",
  "appName": "myapp",
  "serviceName": "myservice",
  "appEnv": "prod",
  "appVersion": "1.0.0",
  "awsRegion": "us-east-1",
  "functionName": "myapp-prod-MyLambdaFunction",
  "functionVersion": "$LATEST",
  "functionMemorySize": "128",
  "awsRequestId": "f56de7fd-fd99-4f12-834f-4e7ac5b16ea0",
  "x-correlation-id": "f56de7fd-fd99-4f12-834f-4e7ac5b16ea0",
  "debug-log-enabled": "false",
  "call-chain-length": 1,
  "level": 30,
  "sLevel": "INFO"
}
```

##### Log.warn('your message here')

```json
{
  "message": "your message here",
  "awsAccountId": "123456789012",
  "appName": "myapp",
  "serviceName": "myservice",
  "appEnv": "prod",
  "appVersion": "1.0.0",
  "awsRegion": "us-east-1",
  "functionName": "myapp-prod-MyLambdaFunction",
  "functionVersion": "$LATEST",
  "functionMemorySize": "128",
  "awsRequestId": "f56de7fd-fd99-4f12-834f-4e7ac5b16ea0",
  "x-correlation-id": "f56de7fd-fd99-4f12-834f-4e7ac5b16ea0",
  "debug-log-enabled": "false",
  "call-chain-length": 1,
  "level": 40,
  "sLevel": "WARN"
}
```

##### Log.error('your message here') / (Passing only a string)

```json
{
  "message": "your message here",
  "awsAccountId": "123456789012",
  "appName": "myapp",
  "serviceName": "myservice",
  "appEnv": "prod",
  "appVersion": "1.0.0",
  "awsRegion": "us-east-1",
  "functionName": "myapp-prod-MyLambdaFunction",
  "functionVersion": "$LATEST",
  "functionMemorySize": "128",
  "awsRequestId": "f56de7fd-fd99-4f12-834f-4e7ac5b16ea0",
  "x-correlation-id": "f56de7fd-fd99-4f12-834f-4e7ac5b16ea0",
  "debug-log-enabled": "false",
  "call-chain-length": 1,
  "level": 50,
  "sLevel": "ERROR"
}
```

##### Log.error('your message here', new Error('Ouch')) / (Passing an Error instance)

```json
{
  "message": "your message here",
  "errorName": "Error",
  "errorMessage": "Ouch",
  "stackTrace": "Error: Ouch at baseHandler ... /main.js:123:36)",
  "awsAccountId": "123456789012",
  "appName": "myapp",
  "serviceName": "myservice",
  "appEnv": "prod",
  "appVersion": "1.0.0",
  "awsRegion": "us-east-1",
  "functionName": "myapp-prod-MyLambdaFunction",
  "functionVersion": "$LATEST",
  "functionMemorySize": "128",
  "awsRequestId": "f56de7fd-fd99-4f12-834f-4e7ac5b16ea0",
  "x-correlation-id": "f56de7fd-fd99-4f12-834f-4e7ac5b16ea0",
  "debug-log-enabled": "false",
  "call-chain-length": 1,
  "level": 50,
  "sLevel": "ERROR"
}
```

##### Uncaught Exception

```json
{
  "message": "invocation failed",
  "errorName": "ReferenceError",
  "errorMessage": "sfd is not defined",
  "stackTrace": "ReferenceError: x is not defined ... main.js:123:36)",
  "awsAccountId": "123456789012",
  "appName": "myapp",
  "serviceName": "myservice",
  "appEnv": "prod",
  "appVersion": "1.0.0",
  "awsRegion": "us-east-1",
  "functionName": "myapp-prod-MyLambdaFunction",
  "functionVersion": "$LATEST",
  "functionMemorySize": "128",
  "awsRequestId": "f56de7fd-fd99-4f12-834f-4e7ac5b16ea0",
  "x-correlation-id": "f56de7fd-fd99-4f12-834f-4e7ac5b16ea0",
  "debug-log-enabled": "false",
  "call-chain-length": 1,
  "level": 50,
  "sLevel": "ERROR"
}
```

##### Lambda Timeout

```json
{
  "message": "invocation timed out",
  "awsRequestId": "f30fcc0c-b811-40be-aaea-df9d7d03a9a4",
  "invocationEvent": "{\"version\":\"0\",\"id\":\"f1314e05-42cc-186a-8de6-cbcf05dad9de\",\"detail-type\":...",
  "awsAccountId": "123456789012",
  "appName": "myapp",
  "serviceName": "myservice",
  "appEnv": "prod",
  "appVersion": "1.0.0",
  "awsRegion": "us-east-1",
  "functionName": "myapp-prod-MyLambdaFunction",
  "functionVersion": "$LATEST",
  "functionMemorySize": "128",
  "awsRequestId": "f56de7fd-fd99-4f12-834f-4e7ac5b16ea0",
  "x-correlation-id": "f56de7fd-fd99-4f12-834f-4e7ac5b16ea0",
  "debug-log-enabled": "false",
  "call-chain-length": 1,
  "level": 50,
  "sLevel": "ERROR"
}
```
