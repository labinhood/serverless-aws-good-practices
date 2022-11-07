"use strict";

var chalk = require("chalk");

function log(msg, addPluginName = false, inverseColor = false) {
  if (addPluginName) {
    msg = this.pluginName + " / " + msg;
  }
  if (!this.v3Utils) {
    if (inverseColor) {
      msg = chalk.inverse(msg);
    }
    this.serverless.cli.log(msg);
  } else {
    if (inverseColor) {
      this.v3Utils.log.warn(msg);
    } else {
      this.v3Utils.log(msg);
    }
  }
}

function error(msg) {
  var fullMsg = this.pluginName + ":\n    " + msg;
  throw new this.serverless.classes.Error(fullMsg);
}

function get(obj, path, defaultValue) {
  return path
    .split(".")
    .filter(Boolean)
    .every((step) => !(step && !(obj = obj[step])))
    ? obj
    : defaultValue;
}

module.exports = {
  log,
  error,
  get,
};
